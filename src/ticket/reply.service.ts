import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarkdownService } from '@/markdown';
import { Reply } from './entities/reply.entity';
import { CreateReplyDto } from './dtos/create-reply.dto';

@Injectable()
export class ReplyService {
  @InjectRepository(Reply)
  private replyRepository: Repository<Reply>;

  constructor(private markdownService: MarkdownService) {}

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

    await this.replyRepository.insert(reply);

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
