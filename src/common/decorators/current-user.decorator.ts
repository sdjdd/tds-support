import { Request } from 'express';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (strict: false, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    if (strict !== false && !req.user) {
      throw new Error('no user in request, please check guard configuration');
    }
    return req.user;
  },
);
