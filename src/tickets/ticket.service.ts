import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import _ from 'lodash';
import { CategoriesService } from '@/categories';
import { SequenceService } from '@/sequence';
import { UsersService } from '@/users';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import { Ticket } from './entities/ticket.entity';
import { status } from './constants';
import { UpdateTicketDto } from './dtos/update-ticket.dto';

@Injectable()
export class TicketsService {
  @InjectRepository(Ticket)
  private ticketsRepository: Repository<Ticket>;

  constructor(
    private sequenceService: SequenceService,
    private categoriesService: CategoriesService,
    private usersService: UsersService,
  ) {}

  findOne(organizationId: number, id: number): Promise<Ticket | undefined> {
    return this.ticketsRepository.findOne({ organizationId, id });
  }

  findOneByNid(
    organizationId: number,
    nid: number,
  ): Promise<Ticket | undefined> {
    return this.ticketsRepository.findOne({ organizationId, nid });
  }

  async findOneByNidOrFail(
    organizationId: number,
    nid: number,
  ): Promise<Ticket> {
    const ticket = await this.findOneByNid(organizationId, nid);
    if (!ticket) {
      throw new NotFoundException(`ticket ${nid} does not exist`);
    }
    return ticket;
  }

  async create(organizationId: number, data: CreateTicketDto): Promise<number> {
    await this.categoriesService.findOneOrFail(organizationId, data.categoryId);
    const ticket = new Ticket();
    ticket.organizationId = organizationId;
    ticket.nid = await this.getNextNid(organizationId);
    ticket.status = status.new;
    ticket.authorId = data.authorId;
    ticket.categoryId = data.categoryId;
    ticket.title = data.title;
    ticket.content = data.content;
    ticket.replyCount = 0;
    await this.ticketsRepository.insert(ticket);
    return ticket.id;
  }

  async update(organizationId: number, nid: number, data: UpdateTicketDto) {
    if (_.isEmpty(data)) {
      return;
    }
    if (data.categoryId) {
      await this.categoriesService.findOneOrFail(
        organizationId,
        data.categoryId,
      );
    }
    if (data.assigneeId) {
      await this.usersService.findOneOrFail(organizationId, data.assigneeId);
    }
    await this.ticketsRepository.update({ organizationId, nid }, data);
  }

  private getNextNid(organizationId: number) {
    return this.sequenceService.getNextId(organizationId, 'ticketNid');
  }
}