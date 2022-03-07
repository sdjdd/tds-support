import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateOrganizationDto } from './dtos/create-organization.dto';
import { CreateSubdomainDto } from './dtos/create-subdomain.dto';
import { UpdateOrganizationDto } from './dtos/update-organization.dto';
import { OrganizationsService } from './organizations.service';
import { SubdomainsService } from './subdomains.service';

@Controller({
  host: process.env.ADMIN_DOMAIN,
  path: 'organizations',
})
export class OrganizationsController {
  constructor(
    private organizationsService: OrganizationsService,
    private subdomainsService: SubdomainsService,
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

  @Post(':id/subdomains')
  createSubdomain(@Param('id') id: number, @Body() data: CreateSubdomainDto) {
    return this.subdomainsService.create(id, data);
  }

  @Get(':id/subdomains')
  findSubdomains(@Param('id') id: number) {
    return this.subdomainsService.find(id);
  }

  @Delete(':id/subdomains/:subdomainId')
  async deleteSubdomain(
    @Param('id') id: number,
    @Param('subdomainId') subdomainId: number,
  ) {
    await this.subdomainsService.delete(id, subdomainId);
  }
}
