import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '@/users';
import { HttpBasicStrategy } from './strategies/http-basic.strategy';

@Module({
  imports: [PassportModule, UsersModule],
  providers: [HttpBasicStrategy],
})
export class AuthModule {}
