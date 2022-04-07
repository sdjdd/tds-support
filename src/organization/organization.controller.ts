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
  UsePipes,
} from '@nestjs/common';
import { ZodValidationPipe } from '@anatine/zod-nestjs';
import { MasterKeyGuard } from '@/common';
import { CreateOrganizationDto } from './dtos/create-organization.dto';
import { CreateDomainDto } from './dtos/create-domain.dto';
import { UpdateOrganizationDto } from './dtos/update-organization.dto';
import { OrganizationService } from './organization.service';
import { DomainService } from './domain.service';

@Controller({
  host: process.env.ADMIN_DOMAIN,
  path: 'organizations',
})
@UseGuards(MasterKeyGuard)
@UsePipes(ZodValidationPipe)
export class OrganizationController {
  constructor(
    private organizationService: OrganizationService,
    private domainService: DomainService,
  ) {}

  @Post()
  async create(@Body() data: CreateOrganizationDto) {
    const id = await this.organizationService.create(data);
    const organization = await this.organizationService.findOne(id);
    return {
      organization,
    };
  }

  @Get()
  async find() {
    const organizations = await this.organizationService.find();
    return {
      organizations,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const organization = await this.organizationService.findOneOrFail(id);
    return {
      organization,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateOrganizationDto,
  ) {
    await this.organizationService.update(id, data);
    const organization = await this.organizationService.findOne(id);
    return {
      organization,
    };
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.organizationService.softDelete(id);
  }

  @Post(':orgId/domains')
  async createDomain(
    @Param('orgId') orgId: number,
    @Body() data: CreateDomainDto,
  ) {
    const id = await this.domainService.create(orgId, data);
    const domain = await this.domainService.findOne(orgId, id);
    return {
      domain,
    };
  }

  @Get(':orgId/domains')
  async findDomains(@Param('orgId') orgId: number) {
    const domains = await this.domainService.find(orgId);
    return {
      domains,
    };
  }

  @Delete(':orgId/domains/:id')
  async deleteDomain(
    @Param('orgId') orgId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    await this.domainService.delete(orgId, id);
  }
}
