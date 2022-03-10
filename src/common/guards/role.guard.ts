import { User } from '@/users';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const allowedRole = this.reflector.get<User['role']>(
      'allowedRole',
      ctx.getHandler(),
    );
    if (!allowedRole) {
      return true;
    }
    const user = ctx.switchToHttp().getRequest<Request>().user as User;
    if (!user) {
      return false;
    }
    if (allowedRole === 'admin') {
      return user.isAdmin();
    }
    if (allowedRole === 'agent') {
      return user.isAgent();
    }
    return false;
  }
}
