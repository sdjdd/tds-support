import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Subdomain } from './entities/subdomain.entity';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { SubdomainsService } from './subdomains.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Subdomain])],
  providers: [OrganizationsService, SubdomainsService],
  controllers: [OrganizationsController],
})
export class OrganizationsModule {}
