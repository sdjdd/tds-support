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
    if (await this.findOneBySubdomain(data.subdomain)) {
      throw new ConflictException(
        `subdomain "${data.subdomain}" already exists`,
      );
    }

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

  async update(id: number, data: UpdateTenantDto) {
    const tenant = await this.tenantRepository.findOne(id);
    if (!tenant) {
      throw new NotFoundException(`tenant ${id} does not exist`);
    }
    await this.tenantRepository.update(id, {
      ...data,
      updated_at: () => 'NOW(3)',
    });
  }
}
