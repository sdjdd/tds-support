import {
  forwardRef,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MarkdownService } from '@/markdown';
import { User, UserService } from '@/user';
import { Reply } from './entities/reply.entity';
import { Ticket } from './entities/ticket.entity';
import { TicketService } from './ticket.service';
import { CreateReplyDto } from './dtos/create-reply.dto';
import { status } from './constants';

@Injectable()
export class ReplyService {
  @InjectRepository(Reply)
  private replyRepository: Repository<Reply>;

  @Inject(forwardRef(() => UserService))
  private userService: UserService;

  constructor(
    private markdownService: MarkdownService,
    private ticketService: TicketService,
  ) {}

  async create(
    orgId: number,
    ticket: Ticket | number,
    author: User | number,
    data: CreateReplyDto,
  ): Promise<number> {
    if (typeof ticket === 'number') {
      ticket = await this.ticketService.findOne(orgId, ticket);
      if (!ticket) {
        throw new UnprocessableEntityException('ticket does not exist');
      }
    }
    if (typeof author === 'number') {
      author = await this.userService.findOne(orgId, author);
      if (!author) {
        throw new UnprocessableEntityException('author does not exist');
      }
    }

    const reply = new Reply();
    reply.orgId = orgId;
    reply.ticketId = ticket.id;
    reply.authorId = author.id;
    reply.public = data.public ?? true;
    reply.content = data.content;
    reply.htmlContent = this.markdownService.render(data.content);
    await this.replyRepository.insert(reply);

    if (reply.public) {
      const authorIsAgent =
        author.id !== ticket.requesterId && author.isAgent();
      const newStatus = authorIsAgent
        ? status.waitingCustomer
        : status.waitingAgent;
      if (ticket.status !== newStatus) {
        await this.ticketService.update(orgId, ticket.id, {
          status: newStatus,
        });
        await this.ticketService.addUpdateSearchIndexJob({
          id: ticket.id,
          fields: ['status'],
        });
      }
    }

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
