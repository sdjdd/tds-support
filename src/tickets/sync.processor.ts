import { Client } from '@elastic/elasticsearch';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import _ from 'lodash';
import { ES_CLIENT } from '@/search';
import { Ticket } from './entities/ticket.entity';
import { CreateSearchDocData, UpdateSearchDocData } from './types';

@Processor('search-index-ticket')
export class SyncProcessor {
  @InjectRepository(Ticket)
  private ticketRepository: Repository<Ticket>;

  @Inject(ES_CLIENT)
  private client: Client;

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
    await this.client.create({
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
    await this.client.update({
      index: 'ticket',
      id: ticket.id.toString(),
      body: {
        doc: updateData,
      },
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
      replyCount: ticket.replyCount,
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
    return _.omitBy(doc, _.isNull);
  }
}
