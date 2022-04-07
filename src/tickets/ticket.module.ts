import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { CaslModule } from '@/casl';
import { CategoryModule } from '@/category';
import { MarkdownModule } from '@/markdown';
import { SearchModule } from '@/search';
import { SequenceModule } from '@/sequence';
import { UserModule } from '@/user';
import { Reply } from './entities/reply.entity';
import { Ticket } from './entities/ticket.entity';
import { ReplyService } from './reply.service';
import { TicketService } from './ticket.service';
import { TicketController } from './ticket.controller';
import { SyncProcessor } from './sync.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Reply]),
    CaslModule,
    CategoryModule,
    MarkdownModule,
    SequenceModule,
    forwardRef(() => UserModule),
    BullModule.registerQueue({
      name: 'search-index-ticket',
      defaultJobOptions: {
        removeOnComplete: true,
      },
    }),
    SearchModule,
  ],
  providers: [ReplyService, TicketService, SyncProcessor],
  controllers: [TicketController],
  exports: [TicketService],
})
export class TicketModule {}
