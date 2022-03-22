import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import _ from 'lodash';
import { AuthGuard, CurrentUser, Org } from '@/common';
import { Organization } from '@/organizations';
import { User } from '@/users';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { TicketsService } from './ticket.service';
import { UpdateTicketDto } from './dtos/update-ticket.dto';

@Controller('tickets')
@UseGuards(AuthGuard)
@UsePipes(ZodValidationPipe)
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  async create(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Body() data: CreateTicketDto,
  ) {
    if (data.authorId === undefined || !user.isAgent()) {
      data.authorId = user.id;
    }
    const id = await this.ticketsService.create(org.id, data);
    const ticket = await this.ticketsService.findOne(org.id, id);
    return {
      ticket,
    };
  }

  @Get(':nid')
  async findOne(
    @Org() org: Organization,
    @CurrentUser() user: User,
    @Param('nid', ParseIntPipe) nid: number,
  ) {
    const ticket = await this.ticketsService.findOneByNidOrFail(org.id, nid);
    if (!user.isAgent() && user.id !== ticket.authorId) {
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
    if (!user.isAgent()) {
      if (user.id !== ticket.authorId) {
        throw new ForbiddenException();
      }
      if (data.assigneeId) {
        throw new ForbiddenException();
      }
    }
    if (!_.isEmpty(data)) {
      await this.ticketsService.update(org.id, nid, data);
      ticket = await this.ticketsService.findOne(org.id, ticket.id);
    }
    return {
      ticket,
    };
  }
}
