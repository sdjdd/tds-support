import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTenantDto } from './dtos/create-tenant.dto';
import { UpdateTenantDto } from './dtos/update-tenant.dto';
import { Tenant } from './entities/tenant.entity';

@Injectable()
export class TenantsService {
  @InjectRepository(Tenant)
  private tenantRepository: Repository<Tenant>;

  async create(data: CreateTenantDto): Promise<Tenant> {
    await this.assertNoSubdomainConflict(data.subdomain);

    const tenant = new Tenant();
    tenant.subdomain = data.subdomain;
    tenant.name = data.name;
    tenant.description = data.description ?? '';

    await this.tenantRepository.insert(tenant);
    return tenant;
  }

  find(): Promise<Tenant[]> {
    return this.tenantRepository.find();
  }

  findOneBySubdomain(subdomain: string): Promise<Tenant | undefined> {
    return this.tenantRepository.findOne({ subdomain });
  }

  private async assertNoSubdomainConflict(subdomain) {
    const tenant = await this.findOneBySubdomain(subdomain);
    if (tenant) {
      throw new ConflictException(`subdomain "${subdomain}" already exists`);
    }
  }

  async update(id: number, data: UpdateTenantDto) {
    const tenant = await this.tenantRepository.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`tenant ${id} does not exist`);
    }
    if (data.subdomain && tenant.subdomain !== data.subdomain) {
      await this.assertNoSubdomainConflict(data.subdomain);
    }
    await this.tenantRepository.update(id, {
      ...data,
      updated_at: () => 'NOW(3)',
    });
  }
}
