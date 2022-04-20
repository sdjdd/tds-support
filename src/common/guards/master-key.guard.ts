import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class MasterKeyGuard implements CanActivate {
  private masterKey: string | undefined;

  constructor(configService: ConfigService) {
    this.masterKey = configService.get('masterKey');
  }

  canActivate(ctx: ExecutionContext): boolean {
    if (!this.masterKey) {
      throw new Error('master key is undefined');
    }
    const req = ctx.switchToHttp().getRequest<Request>();
    return this.masterKey === req.get('x-lc-key');
  }
}
