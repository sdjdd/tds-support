import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from '@/categories';
import { SequenceModule } from '@/sequence';
import { UsersModule } from '@/users';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './ticket.service';
import { TicketsController } from './tickets.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    CategoriesModule,
    SequenceModule,
    UsersModule,
  ],
  providers: [TicketsService],
  controllers: [TicketsController],
})
export class TicketsModule {}
