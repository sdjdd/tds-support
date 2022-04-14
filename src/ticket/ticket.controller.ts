import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import _ from 'lodash';
import { AuthGuard, CurrentUser, Org } from '@/common';
import { CaslAbilityFactory } from '@/casl';
import { Client } from '@elastic/elasticsearch';
import esb from 'elastic-builder';
import { Organization } from '@/organization';
import { User } from '@/user';
import {
  ParseOrderByPipe,
  ParsePagePipe,
  ParsePageSizePipe,
} from '@/common/pipes';
import { ES_CLIENT } from '@/search';
import { Ticket } from './entities/ticket.entity';
import { ReplyService } from './reply.service';
import { TicketService } from './ticket.service';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import { FindTicketsDto } from './dtos/find-tickets.dto';
import { CreateReplyDto } from './dtos/create-reply.dto';
import { ParseFilterPipe, ParseFilterResult } from './pipes/parse-filter.pipe';

@Controller('tickets')
@UseGuards(AuthGuard)
@UsePipes(ZodValidationPipe)
export class TicketController {
  @Inject(ES_CLIENT) client: Client;

  constructor(
    private caslAbilityFactory: CaslAbilityFactory,
    private replyService: ReplyService,
    private ticketService: TicketService,
  ) {}

  @Post()
  async create(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Body() data: CreateTicketDto,
  ) {
    const ability = this.caslAbilityFactory.createForUser(user);
    Object.keys(data).forEach((field) => {
      if (ability.cannot('create', Ticket, field)) {
        throw new ForbiddenException(
          `you don't have permission to create ticket with ${field}`,
        );
      }
    });
    data.requesterId ??= user.id;
    const id = await this.ticketService.create(org.id, data);
    const ticket = await this.ticketService.findOne(org.id, id);
    return {
      ticket,
    };
  }

  @Get()
  async find(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Query() params: FindTicketsDto,
  ) {
    if (!user.isAgent()) {
      throw new ForbiddenException();
    }
    const tickets = await this.ticketService.find(org.id, params as any);
    return {
      tickets,
    };
  }

  @Get('search')
  async search(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Query('filter', ParseFilterPipe) filter: ParseFilterResult,
    @Query(
      'orderBy',
      new ParseOrderByPipe(['status', 'createdAt', 'updatedAt'], 'id'),
    )
    orderBy: [string, 'ASC' | 'DESC'],
    @Query('page', ParsePagePipe) page: number,
    @Query('pageSize', ParsePageSizePipe) pageSize: number,
  ) {
    if (!user.isAgent()) {
      throw new ForbiddenException();
    }

    const skip = (page - 1) * pageSize;
    if (skip + pageSize > 10000) {
      // See: https://www.elastic.co/guide/en/elasticsearch/reference/7.9/index-modules.html#index-max-result-window
      throw new BadRequestException('cannot skip more than 10000 results');
    }

    const { properties, terms } = filter;
    const body = esb.requestBodySearch();
    const boolQuery = esb
      .boolQuery()
      .filter(esb.matchQuery('orgId', org.id.toString()));

    const addMatchQuery = (field: string, values: string[]) => {
      const inner = esb.boolQuery();
      values.forEach((value) => {
        if (value === 'none') {
          inner.should(esb.boolQuery().mustNot(esb.existsQuery(field)));
        } else {
          inner.should(esb.matchQuery(field, value));
        }
      });
      boolQuery.filter(inner);
    };

    const addRangeQuery = (field: string, data: typeof properties[string]) => {
      const query = esb.rangeQuery(field);
      ['gt', 'gte', 'lt', 'lte'].forEach((type) => {
        if (data[type] !== undefined) {
          query[type](data[type]);
        }
      });
      boolQuery.filter(query);
    };

    if (properties) {
      [
        'categoryId',
        'requesterId',
        'assigneeId',
        'createdAt',
        'updatedAt',
        'status',
      ].forEach((field) => {
        if (properties[field]?.eq) {
          addMatchQuery(field, properties[field].eq);
        }
      });

      ['status', 'createdAt', 'updatedAt'].forEach((field) => {
        const data = properties[field];
        if (data) {
          const hasRangeData = ['gt', 'gte', 'lt', 'lte'].some(
            (type) => type in data,
          );
          if (hasRangeData) {
            addRangeQuery(field, data);
          }
        }
      });
    }

    if (terms) {
      terms.forEach((term) => {
        const inner = esb.multiMatchQuery(['title', 'content'], term.value);
        if (term.quoted) {
          inner.type('phrase');
        }
        boolQuery.must(inner);
      });
    }

    body.query(boolQuery).from(skip).size(pageSize);

    if (orderBy) {
      body.sort(esb.sort(orderBy[0], orderBy[1]));
    }

    const {
      body: { hits },
    } = await this.client.search({ index: 'ticket', body });

    return {
      filter,
      count: hits.total.value,
      tickets: hits.hits.map(({ _source }) => {
        const ticket = new Ticket();
        Object.assign(ticket, _source);
        return ticket;
      }),
    };
  }

  @Get(':seq')
  async findOne(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Param('seq', ParseIntPipe) seq: number,
  ) {
    const ticket = await this.ticketService.findOneBySeqOrFail(org.id, seq);
    const ability = this.caslAbilityFactory.createForUser(user);
    if (ability.cannot('read', ticket)) {
      throw new ForbiddenException();
    }
    return {
      ticket,
    };
  }

  @Patch(':seq')
  async update(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Param('seq', ParseIntPipe) seq: number,
    @Body() data: UpdateTicketDto,
  ) {
    let ticket = await this.ticketService.findOneBySeqOrFail(org.id, seq);
    const ability = this.caslAbilityFactory.createForUser(user);
    if (ability.cannot('update', ticket)) {
      throw new ForbiddenException();
    }
    Object.keys(data).forEach((field) => {
      if (ability.cannot('update', ticket, field)) {
        throw new ForbiddenException(
          `you don't have permission to update ticket ${field}`,
        );
      }
    });
    if (!_.isEmpty(data)) {
      await this.ticketService.update(org.id, ticket.id, data);
      ticket = await this.ticketService.findOne(org.id, ticket.id);
    }
    return {
      ticket,
    };
  }

  @Post(':seq/replies')
  async createReply(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Param('seq', ParseIntPipe) seq: number,
    @Body() data: CreateReplyDto,
  ) {
    const ticket = await this.ticketService.findOneBySeqOrFail(org.id, seq);
    const ability = this.caslAbilityFactory.createForUser(user);
    if (ability.cannot('read', ticket)) {
      throw new ForbiddenException();
    }
    if (!user.isAgent()) {
      data.public = true;
    }
    const replyId = await this.replyService.create(org.id, ticket, user, data);
    const reply = await this.replyService.findOne(org.id, ticket.id, replyId);
    return {
      reply,
    };
  }

  @Get(':seq/replies')
  async findReplies(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Param('seq', ParseIntPipe) seq: number,
  ) {
    const ticket = await this.ticketService.findOneBySeqOrFail(org.id, seq);
    const ability = this.caslAbilityFactory.createForUser(user);
    if (ability.cannot('read', ticket)) {
      throw new ForbiddenException();
    }
    const replies = await this.replyService.findForTicket(
      org.id,
      ticket.id,
      !user.isAgent(),
    );
    return {
      replies,
    };
  }
}
