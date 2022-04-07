import { TicketsModule } from '@/tickets';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => TicketsModule)],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
