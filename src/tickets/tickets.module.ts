import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from '@/casl';
import { CategoriesModule } from '@/categories';
import { MarkdownModule } from '@/markdown';
import { SequenceModule } from '@/sequence';
import { UsersModule } from '@/users';
import { Reply } from './entities/reply.entity';
import { Ticket } from './entities/ticket.entity';
import { ReplyService } from './reply.service';
import { TicketsService } from './ticket.service';
import { TicketsController } from './tickets.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Reply]),
    CaslModule,
    CategoriesModule,
    MarkdownModule,
    SequenceModule,
    forwardRef(() => UsersModule),
  ],
  providers: [ReplyService, TicketsService],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}
