import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
  async create(@Body() data: CreateOrganizationDto) {
    const id = await this.organizationsService.create(data);
    const organization = await this.organizationsService.findOne(id);
    return {
      organization,
    };
  }

  @Get()
  async find() {
    const organizations = await this.organizationsService.find();
    return {
      organizations,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const organization = await this.organizationsService.findOneOrFail(id);
    return {
      organization,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateOrganizationDto,
  ) {
    await this.organizationsService.update(id, data);
    const organization = await this.organizationsService.findOne(id);
    return {
      organization,
    };
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.organizationsService.softDelete(id);
  }

  @Post(':orgId/domains')
  async createDomain(
    @Param('orgId') orgId: number,
    @Body() data: CreateDomainDto,
  ) {
    const id = await this.domainsService.create(orgId, data);
    const domain = await this.domainsService.findOne(orgId, id);
    return {
      domain,
    };
  }

  @Get(':orgId/domains')
  async findDomains(@Param('orgId') orgId: number) {
    const domains = await this.domainsService.find(orgId);
    return {
      domains,
    };
  }

  @Delete(':orgId/domains/:id')
  async deleteDomain(
    @Param('orgId') orgId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.domainsService.delete(orgId, id);
  }
}
