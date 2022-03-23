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
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { UpdateTicketDto } from './dtos/update-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './ticket.service';
import { FindTicketsDto } from './dtos/find-tickets.dto';

@Controller('tickets')
@UseGuards(AuthGuard)
@UsePipes(ZodValidationPipe)
export class TicketsController {
  constructor(
    private caslAbilityFactory: CaslAbilityFactory,
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
    data.authorId ??= user.id;
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

  @Get(':nid')
  async findOne(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Param('nid', ParseIntPipe) nid: number,
  ) {
    const ticket = await this.ticketsService.findOneByNidOrFail(org.id, nid);
    const ability = this.caslAbilityFactory.createForUser(user);
    if (ability.cannot('read', ticket)) {
      throw new ForbiddenException();
    }
    return {
      ticket,
    };
  }

  @Patch(':nid')
  async update(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Param('nid', ParseIntPipe) nid: number,
    @Body() data: UpdateTicketDto,
  ) {
    let ticket = await this.ticketsService.findOneByNidOrFail(org.id, nid);
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
      await this.ticketsService.update(org.id, nid, data);
      ticket = await this.ticketsService.findOne(org.id, ticket.id);
    }
    return {
      ticket,
    };
  }
}
