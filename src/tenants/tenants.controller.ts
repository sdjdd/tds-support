import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateTenantDto } from './dtos/create-tenant.dto';
import { UpdateTenantDto } from './dtos/update-tenant.dto';
import { TenantsService } from './tenants.service';

@Controller({
  host: process.env.ADMIN_DOMAIN,
  path: 'tenants',
})
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Post()
  create(@Body() data: CreateTenantDto) {
    return this.tenantsService.create(data);
  }

  @Get()
  find() {
    return this.tenantsService.find();
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() data: UpdateTenantDto) {
    await this.tenantsService.update(id, data);
  }
}
