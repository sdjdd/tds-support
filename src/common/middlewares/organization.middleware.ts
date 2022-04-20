import {
  BadGatewayException,
  Injectable,
  NestMiddleware,
  NotFoundException,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Organization, OrganizationService } from '@/organization';
import { ConfigService } from '@nestjs/config';

declare module 'express' {
  interface Request {
    organization: Organization;
  }
}

@Injectable()
export class OrganizationMiddleware implements NestMiddleware {
  private baseUrl: string | undefined;

  constructor(
    configService: ConfigService,
    private organizationService: OrganizationService,
  ) {
    this.baseUrl = configService.get('baseUrl');
  }

  async use(req: Request, _res: Response, next: NextFunction) {
    const subdomain = this.baseUrl
      ? this.getSubdomainFromHostname(this.baseUrl, req.hostname)
      : this.getSubdomainFromSubdomains(req.subdomains);
    if (!subdomain) {
      throw new BadGatewayException();
    }

    const organization = await this.organizationService.findOneBySubdomain(
      subdomain,
    );
    if (!organization) {
      throw new NotFoundException();
    }

    req.organization = organization;
    next();
  }

  private getSubdomainFromSubdomains(subdomains: string[]) {
    if (subdomains.length) {
      return subdomains[subdomains.length - 1];
    }
  }

  private getSubdomainFromHostname(baseUrl: string, hostname: string) {
    const suffix = '.' + baseUrl;
    const length = hostname.length - suffix.length;
    if (length > 0 && hostname.endsWith(suffix)) {
      return hostname.slice(0, length);
    }
  }
}
