import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Domain } from './entities/domain.entity';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { DomainService } from './domain.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Organization, Domain])],
  providers: [OrganizationsService, DomainService],
  controllers: [OrganizationsController],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
