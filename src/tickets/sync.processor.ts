import { Client } from '@elastic/elasticsearch';
import { Process, Processor } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Repository } from 'typeorm';
import _ from 'lodash';
import { ES_CLIENT } from '@/search';
import { Ticket } from './entities/ticket.entity';

const CURRENT_VERSION = 1;

@Processor('syncTicket')
export class SyncProcessor {
  @InjectRepository(Ticket)
  private ticketRepository: Repository<Ticket>;

  @Inject(ES_CLIENT)
  private client: Client;

  @Process('new')
  async syncNewTicket() {
    const tickets = await this.ticketRepository.find({
      where: {
        syncedVersion: IsNull(),
      },
      take: 100,
    });

    if (tickets.length) {
      await this.doSync(tickets);
    }
  }

  @Process('outdated')
  async syncTicket() {
    const tickets = await this.ticketRepository.find({
      where: {
        syncedVersion: LessThan(CURRENT_VERSION),
      },
      take: 100,
    });

    if (tickets.length) {
      await this.doSync(tickets);
    }
  }

  private async doSync(tickets: Ticket[]) {
    const docs = tickets.map((ticket) => {
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
    });

    await this.client.bulk({
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

    for (const ticket of tickets) {
      await this.ticketRepository.update(
        {
          id: ticket.id,
          updatedAt: ticket.updatedAt,
        },
        {
          syncedVersion: CURRENT_VERSION,
          updatedAt: () => 'updated_at', // do not change updated_at
        },
      );
    }
  }
}
