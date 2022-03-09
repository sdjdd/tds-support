import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Domain } from './entities/domain.entity';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { DomainsService } from './domains.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Organization, Domain])],
  providers: [OrganizationsService, DomainsService],
  controllers: [OrganizationsController],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
