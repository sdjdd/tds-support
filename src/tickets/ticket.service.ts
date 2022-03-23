import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
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

export interface FindTicketsOptions {
  authorId?: number;
  assigneeId?: number;
  page?: number;
  pageSize?: number;
  orderBy?: ['seq' | 'status' | 'createdAt', 'ASC' | 'DESC'];
}

@Injectable()
export class TicketsService {
  @InjectRepository(Ticket)
  private ticketsRepository: Repository<Ticket>;

  constructor(
    private sequenceService: SequenceService,
    private categoriesService: CategoriesService,
    private usersService: UsersService,
  ) {}

  async find(
    orgId: number,
    {
      authorId,
      assigneeId,
      page = 1,
      pageSize = 100,
      orderBy,
    }: FindTicketsOptions,
  ): Promise<Ticket[]> {
    const qb = this.ticketsRepository.createQueryBuilder('ticket');
    qb.select([
      'ticket.nid',
      'ticket.categoryId',
      'ticket.authorId',
      'ticket.assigneeId',
      'ticket.title',
      'ticket.status',
      'ticket.replyCount',
      'ticket.createdAt',
      'ticket.updatedAt',
    ]);
    qb.where('ticket.orgId = :orgId', { orgId });
    if (authorId) {
      qb.andWhere('ticket.authorId = :authorId', { authorId });
    }
    if (assigneeId) {
      qb.andWhere('ticket.assigneeId = :assigneeId', { assigneeId });
    }
    if (orderBy) {
      qb.orderBy(...orderBy);
    }
    qb.skip((page - 1) * pageSize);
    qb.take(pageSize);
    const tickets = await qb.getMany();
    return tickets;
  }

  findOne(orgId: number, id: number): Promise<Ticket | undefined> {
    return this.ticketsRepository.findOne({ orgId, id });
  }

  findOneBySeq(orgId: number, seq: number): Promise<Ticket | undefined> {
    return this.ticketsRepository.findOne({ orgId, seq });
  }

  async findOneBySeqOrFail(orgId: number, seq: number): Promise<Ticket> {
    const ticket = await this.findOneBySeq(orgId, seq);
    if (!ticket) {
      throw new NotFoundException(`ticket ${seq} does not exist`);
    }
    return ticket;
  }

  async create(orgId: number, data: CreateTicketDto): Promise<number> {
    await this.categoriesService.findOneOrFail(orgId, data.categoryId);
    await this.usersService.findOneOrFail(orgId, data.requesterId);
    const ticket = new Ticket();
    ticket.orgId = orgId;
    ticket.seq = await this.getNextSeq(orgId);
    ticket.status = status.new;
    ticket.requesterId = data.requesterId;
    ticket.categoryId = data.categoryId;
    ticket.title = data.title;
    ticket.content = data.content;
    ticket.replyCount = 0;
    await this.ticketsRepository.insert(ticket);
    return ticket.id;
  }

  async update(orgId: number, seq: number, data: UpdateTicketDto) {
    if (_.isEmpty(data)) {
      return;
    }
    if (data.categoryId) {
      await this.categoriesService.findOneOrFail(orgId, data.categoryId);
    }
    if (data.assigneeId) {
      await this.assertAssigneeIdIsValid(orgId, data.assigneeId);
    }
    await this.ticketsRepository.update({ orgId, seq }, data);
  }

  private getNextSeq(orgId: number) {
    return this.sequenceService.getNext(orgId, 'ticketNid');
  }

  private async assertAssigneeIdIsValid(orgId: number, assigneeId: number) {
    const user = await this.usersService.findOneOrFail(orgId, assigneeId);
    if (!user.isAgent()) {
      throw new UnprocessableEntityException(`user ${assigneeId} is not agent`);
    }
  }
}
