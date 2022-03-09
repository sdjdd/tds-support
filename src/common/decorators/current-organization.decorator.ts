import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentOrganization = createParamDecorator(
  (data: void, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const organization = req.organization;
    if (!organization) {
      throw new Error(
        'no organization in request, please check middleware configuration',
      );
    }
    return organization;
  },
);

// just an alias :)
export const Org = CurrentOrganization;
