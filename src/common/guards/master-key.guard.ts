import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class MasterKeyGuard implements CanActivate {
  private masterKey: string;

  constructor() {
    this.masterKey = process.env.LEANCLOUD_APP_MASTER_KEY;
  }

  canActivate(ctx: ExecutionContext): boolean {
    if (!this.masterKey) {
      throw new Error('master key is undefined');
    }
    const req = ctx.switchToHttp().getRequest<Request>();
    return this.masterKey === req.get('x-lc-key');
  }
}
