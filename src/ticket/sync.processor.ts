import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import _ from 'lodash';
import { Ticket } from './entities/ticket.entity';
import {
  CreateSearchDocData,
  RebuildSearchIndexData,
  UpdateSearchDocData,
} from './types';

@Processor('search-index-ticket')
export class SyncProcessor {
  @InjectRepository(Ticket)
  private ticketRepository: Repository<Ticket>;

  constructor(
    private esService: ElasticsearchService,

    @InjectQueue('search-index-ticket')
    private searchIndexQueue: Queue,
  ) {}

  @Process({
    name: 'create',
    concurrency: 4,
  })
  async createSearchDoc(job: Job<CreateSearchDocData>) {
    const ticket = await this.ticketRepository.findOne(job.data.id);
    if (!ticket) {
      return;
    }
    const doc = this.newSearchDoc(ticket);
    await this.esService.create({
      index: 'ticket',
      id: ticket.id.toString(),
      body: doc,
    });
  }

  @Process({
    name: 'update',
    concurrency: 4,
  })
  async updateSearchDoc(job: Job<UpdateSearchDocData>) {
    const ticket = await this.ticketRepository.findOne(job.data.id);
    if (!ticket) {
      return;
    }
    const doc = this.newSearchDoc(ticket);
    const updateData = _.pick(doc, job.data.fields);
    updateData.updatedAt = doc.updatedAt;
    await this.esService.update({
      index: 'ticket',
      id: ticket.id.toString(),
      body: {
        doc: updateData,
      },
    });
  }

  @Process('rebuild')
  async rebuildSearchIndex(job: Job<RebuildSearchIndexData>) {
    const { startId, endId } = job.data;
    const qb = this.ticketRepository.createQueryBuilder('ticket');
    qb.where('ticket.id >= :startId', { startId });
    if (endId) {
      qb.andWhere('ticket.id < :endId', { endId });
    }
    qb.orderBy('ticket.id', 'ASC');
    qb.take(1000);

    const tickets = await qb.getMany();
    if (tickets.length === 0) {
      console.log('rebuild ticket search index finish');
      return;
    }

    const docs = tickets.map((ticket) => this.newSearchDoc(ticket));
    await this.esService.bulk({
      body: docs
        .map((doc) => [
          {
            index: {
              _index: 'ticket',
              _id: doc.id,
            },
          },
          doc,
        ])
        .flat(),
    });

    const maxId = _.last(tickets).id;
    const jobData: RebuildSearchIndexData = {
      startId: maxId + 1,
      endId,
    };
    await this.searchIndexQueue.add('rebuild', jobData, {
      delay: 2000,
    });
  }

  private newSearchDoc(ticket: Ticket) {
    const doc = {
      id: ticket.id,
      orgId: ticket.orgId,
      seq: ticket.seq,
      categoryId: ticket.categoryId,
      requesterId: ticket.requesterId,
      assigneeId: ticket.assigneeId,
      title: ticket.title,
      content: ticket.content,
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
    return _.omitBy(doc, _.isNull);
  }
}
