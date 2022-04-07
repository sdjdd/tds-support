import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '@/user';
import { HttpBasicStrategy } from './strategies/http-basic.strategy';

@Module({
  imports: [PassportModule, UserModule],
  providers: [HttpBasicStrategy],
})
export class AuthModule {}
