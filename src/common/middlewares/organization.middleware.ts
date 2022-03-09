import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Organization, OrganizationsService } from '@/organizations';

declare module 'express' {
  interface Request {
    organization: Organization;
  }
}

@Injectable()
export class OrganizationMiddleware implements NestMiddleware {
  constructor(private organizationsService: OrganizationsService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { subdomains } = req;
    if (subdomains.length === 0) {
      throw new NotFoundException();
    }
    const subdomain = subdomains[subdomains.length - 1];
    const organization = await this.organizationsService.findOneBySubdomain(
      subdomain,
    );
    if (!organization) {
      throw new NotFoundException();
    }
    req.organization = organization;
    next();
  }
}
