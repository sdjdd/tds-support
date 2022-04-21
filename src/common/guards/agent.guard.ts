import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@/user';

@Injectable()
export class AgentGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const user = ctx.switchToHttp().getRequest<Request>().user as User;
    if (!user) {
      throw new Error('No user in request, check guards configuration');
    }
    return user.isAgent();
  }
}
