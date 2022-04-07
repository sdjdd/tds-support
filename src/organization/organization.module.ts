import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organization } from './entities/organization.entity';
import { Domain } from './entities/domain.entity';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { DomainService } from './domain.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Organization, Domain])],
  providers: [OrganizationService, DomainService],
  controllers: [OrganizationController],
  exports: [OrganizationService],
})
export class OrganizationModule {}
