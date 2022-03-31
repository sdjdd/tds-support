import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { MarkdownService } from '@/markdown';
import { Reply } from './entities/reply.entity';
import { Ticket } from './entities/ticket.entity';
import { CreateReplyDto } from './dtos/create-reply.dto';
import { UpdateSearchDocData } from './types';

@Injectable()
export class ReplyService {
  @InjectConnection()
  private connection: Connection;

  @InjectRepository(Reply)
  private replyRepository: Repository<Reply>;

  constructor(
    private markdownService: MarkdownService,
    @InjectQueue('search-index-ticket')
    private searchIndexQueue: Queue,
  ) {}

  async create(
    orgId: number,
    ticketId: number,
    authorId: number,
    data: CreateReplyDto,
  ): Promise<number> {
    const reply = new Reply();
    reply.orgId = orgId;
    reply.ticketId = ticketId;
    reply.authorId = authorId;
    reply.public = data.public ?? true;
    reply.content = data.content;
    reply.htmlContent = this.markdownService.render(data.content);

    await this.connection.transaction(async (manager) => {
      await manager.insert(Reply, reply);
      await manager.update(
        Ticket,
        { orgId, id: ticketId },
        {
          replyCount: () => 'reply_count + 1',
        },
      );
    });

    const jobData: UpdateSearchDocData = {
      id: ticketId,
      fields: ['replyCount'],
    };
    await this.searchIndexQueue.add('update', jobData);

    return reply.id;
  }

  async findOne(
    orgId: number,
    ticketId: number,
    id: number,
  ): Promise<Reply | undefined> {
    return this.replyRepository.findOne({ orgId, ticketId, id });
  }

  findForTicket(
    orgId: number,
    ticketId: number,
    onlyPublic = true,
  ): Promise<Reply[]> {
    const qb = this.replyRepository.createQueryBuilder('reply');
    qb.where('reply.orgId = :orgId', { orgId });
    qb.andWhere('reply.ticketId = :ticketId', { ticketId });
    if (onlyPublic) {
      qb.andWhere('reply.public = 1');
    }
    return qb.getMany();
  }
}
