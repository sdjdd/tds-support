import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CaslModule } from '@/casl';
import { CategoriesModule } from '@/categories';
import { SequenceModule } from '@/sequence';
import { UsersModule } from '@/users';
import { Ticket } from './entities/ticket.entity';
import { TicketsService } from './ticket.service';
import { TicketsController } from './tickets.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ticket]),
    CaslModule,
    CategoriesModule,
    SequenceModule,
    forwardRef(() => UsersModule),
  ],
  providers: [TicketsService],
  controllers: [TicketsController],
  exports: [TicketsService],
})
export class TicketsModule {}
