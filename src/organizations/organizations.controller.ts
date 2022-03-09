import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { MasterKeyGuard } from '@/common';
import { CreateOrganizationDto } from './dtos/create-organization.dto';
import { CreateDomainDto } from './dtos/create-domain.dto';
import { UpdateOrganizationDto } from './dtos/update-organization.dto';
import { OrganizationsService } from './organizations.service';
import { DomainsService } from './domains.service';

@Controller({
  host: process.env.ADMIN_DOMAIN,
  path: 'organizations',
})
@UseGuards(MasterKeyGuard)
export class OrganizationsController {
  constructor(
    private organizationsService: OrganizationsService,
    private domainsService: DomainsService,
  ) {}

  @Post()
  create(@Body() data: CreateOrganizationDto) {
    return this.organizationsService.create(data);
  }

  @Get()
  find() {
    return this.organizationsService.find();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.organizationsService.findOneOrFail(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() data: UpdateOrganizationDto) {
    await this.organizationsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.organizationsService.softDelete(id);
  }

  @Post(':id/domains')
  createDomain(@Param('id') id: number, @Body() data: CreateDomainDto) {
    return this.domainsService.create(id, data);
  }

  @Get(':id/domains')
  findDomains(@Param('id') id: number) {
    return this.domainsService.find(id);
  }

  @Delete(':id/domains/:domainId')
  async deleteDomain(
    @Param('id') id: number,
    @Param('domainId') domainId: number,
  ) {
    await this.domainsService.delete(id, domainId);
  }
}
