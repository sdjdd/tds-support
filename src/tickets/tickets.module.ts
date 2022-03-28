import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
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
import { SyncProcessor } from './sync.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket, Reply]),
    CaslModule,
    CategoriesModule,
    MarkdownModule,
    SequenceModule,
    forwardRef(() => UsersModule),
    BullModule.registerQueue({
      name: 'sync-to-es',
      defaultJobOptions: {
        removeOnComplete: true,
      },
    }),
  ],
  providers: [ReplyService, TicketsService, SyncProcessor],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}
