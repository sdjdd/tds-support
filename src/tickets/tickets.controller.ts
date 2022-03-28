import {
  Body,
  Controller,
  ForbiddenException,
  Get,
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
import { Organization } from '@/organizations';
import { User } from '@/users';
import { Ticket } from './entities/ticket.entity';
import { ReplyService } from './reply.service';
import { TicketsService } from './ticket.service';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import { FindTicketsDto } from './dtos/find-tickets.dto';
import { CreateReplyDto } from './dtos/create-reply.dto';

@Controller('tickets')
@UseGuards(AuthGuard)
@UsePipes(ZodValidationPipe)
export class TicketsController {
  constructor(
    private caslAbilityFactory: CaslAbilityFactory,
    private replyService: ReplyService,
    private ticketsService: TicketsService,
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
    const id = await this.ticketsService.create(org.id, data);
    const ticket = await this.ticketsService.findOne(org.id, id);
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
    const tickets = await this.ticketsService.find(org.id, params as any);
    return {
      tickets,
    };
  }

  @Get(':seq')
  async findOne(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Param('seq', ParseIntPipe) seq: number,
  ) {
    const ticket = await this.ticketsService.findOneBySeqOrFail(org.id, seq);
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
    let ticket = await this.ticketsService.findOneBySeqOrFail(org.id, seq);
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
      await this.ticketsService.update(org.id, seq, data);
      ticket = await this.ticketsService.findOne(org.id, ticket.id);
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
    const ticket = await this.ticketsService.findOneBySeqOrFail(org.id, seq);
    const ability = this.caslAbilityFactory.createForUser(user);
    if (ability.cannot('read', ticket)) {
      throw new ForbiddenException();
    }
    if (!user.isAgent()) {
      data.public = true;
    }
    const replyId = await this.replyService.create(
      org.id,
      ticket.id,
      user.id,
      data,
    );
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
    const ticket = await this.ticketsService.findOneBySeqOrFail(org.id, seq);
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
