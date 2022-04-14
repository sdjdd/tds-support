import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import _ from 'lodash';
import { CategoryService } from '@/category';
import { MarkdownService } from '@/markdown';
import { SequenceService } from '@/sequence';
import { UserService } from '@/user';
import { status } from './constants';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dtos/create-ticket.dto';
import {
  CreateSearchDocData,
  FindTicketsOptions,
  UpdateSearchDocData,
} from './types';

@Injectable()
export class TicketService {
  @InjectRepository(Ticket)
  private ticketRepository: Repository<Ticket>;

  @Inject(forwardRef(() => UserService))
  private userService: UserService;

  constructor(
    private categoryService: CategoryService,
    private markdownService: MarkdownService,
    private sequenceService: SequenceService,

    @InjectQueue('search-index-ticket')
    private searchIndexQueue: Queue,
  ) {}

  async find(
    orgId: number,
    {
      requesterId,
      assigneeId,
      page = 1,
      pageSize = 100,
      orderBy,
    }: FindTicketsOptions,
  ): Promise<Ticket[]> {
    const qb = this.ticketRepository.createQueryBuilder('ticket');
    qb.select([
      'ticket.seq',
      'ticket.categoryId',
      'ticket.requesterId',
      'ticket.assigneeId',
      'ticket.title',
      'ticket.status',
      'ticket.createdAt',
      'ticket.updatedAt',
    ]);
    qb.where('ticket.orgId = :orgId', { orgId });
    if (requesterId) {
      qb.andWhere('ticket.requesterId = :requesterId', { requesterId });
    }
    if (assigneeId) {
      qb.andWhere('ticket.assigneeId = :assigneeId', { assigneeId });
    }
    if (orderBy) {
      qb.orderBy(`ticket.${orderBy[0]}`, orderBy[1]);
    }
    qb.skip((page - 1) * pageSize);
    qb.take(pageSize);
    const tickets = await qb.getMany();
    return tickets;
  }

  findOne(orgId: number, id: number): Promise<Ticket | undefined> {
    return this.ticketRepository.findOne({ orgId, id });
  }

  findOneBySeq(orgId: number, seq: number): Promise<Ticket | undefined> {
    return this.ticketRepository.findOne({ orgId, seq });
  }

  async findOneBySeqOrFail(orgId: number, seq: number): Promise<Ticket> {
    const ticket = await this.findOneBySeq(orgId, seq);
    if (!ticket) {
      throw new NotFoundException(`ticket ${seq} does not exist`);
    }
    return ticket;
  }

  async create(orgId: number, data: CreateTicketDto): Promise<number> {
    await this.categoryService.findOneOrFail(orgId, data.categoryId);
    await this.userService.findOneOrFail(orgId, data.requesterId);

    const ticket = new Ticket();
    ticket.orgId = orgId;
    ticket.seq = await this.getNextSequence(orgId);
    ticket.status = status.new;
    ticket.requesterId = data.requesterId;
    ticket.categoryId = data.categoryId;
    ticket.title = data.title;
    ticket.content = data.content;
    ticket.htmlContent = this.markdownService.render(data.content);

    await this.ticketRepository.insert(ticket);

    const jobData: CreateSearchDocData = {
      id: ticket.id,
    };
    await this.searchIndexQueue.add('create', jobData);

    return ticket.id;
  }

  async update(orgId: number, id: number, data: Partial<Ticket>) {
    if (_.isEmpty(data)) {
      return;
    }

    if (data.categoryId) {
      await this.categoryService.findOneOrFail(orgId, data.categoryId);
    }
    if (data.assigneeId) {
      await this.assertAssigneeIdIsValid(orgId, data.assigneeId);
    }

    await this.ticketRepository.update(id, data);

    await this.addUpdateSearchIndexJob({
      id,
      fields: Object.keys(data),
    });
  }

  async addUpdateSearchIndexJob(jobData: UpdateSearchDocData) {
    await this.searchIndexQueue.add('update', jobData, {
      attempts: 3,
      backoff: 1000,
    });
  }

  private getNextSequence(orgId: number) {
    return this.sequenceService.getNext(orgId, 'ticket');
  }

  private async assertAssigneeIdIsValid(orgId: number, assigneeId: number) {
    const user = await this.userService.findOneOrFail(orgId, assigneeId);
    if (!user.isAgent()) {
      throw new UnprocessableEntityException(`user ${assigneeId} is not agent`);
    }
  }
}
