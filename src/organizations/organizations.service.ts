import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrganizationDto } from './dtos/create-organization.dto';
import { UpdateOrganizationDto } from './dtos/update-organization.dto';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  @InjectRepository(Organization)
  private organizationsRepository: Repository<Organization>;

  private async assertNoSubdomainConflict(subdomain: string) {
    const organization = await this.findOneBySubdomain(subdomain);
    if (organization) {
      throw new ConflictException(`subdomain "${subdomain}" already exists`);
    }
  }

  async create(data: CreateOrganizationDto): Promise<Organization> {
    if (data.subdomain) {
      await this.assertNoSubdomainConflict(data.subdomain);
    }

    const organization = new Organization();
    organization.name = data.name;
    organization.description = data.description ?? '';
    organization.subdomain = data.subdomain;

    await this.organizationsRepository.insert(organization);
    return organization;
  }

  find(): Promise<Organization[]> {
    return this.organizationsRepository.find();
  }

  async findOneOrFail(id: number): Promise<Organization> {
    const organization = await this.organizationsRepository.findOne(id);
    if (!organization) {
      throw new NotFoundException(`organization ${id} does not exist`);
    }
    return organization;
  }

  findOneBySubdomain(subdomain: string): Promise<Organization | undefined> {
    return this.organizationsRepository.findOne({ subdomain });
  }

  async update(id: number, data: UpdateOrganizationDto) {
    const organization = await this.findOneOrFail(id);
    if (
      data.subdomain !== undefined &&
      organization.subdomain !== data.subdomain
    ) {
      await this.assertNoSubdomainConflict(data.subdomain);
    }
    await this.organizationsRepository.update(id, data);
  }

  async softDelete(id: number) {
    await this.findOneOrFail(id);
    await this.organizationsRepository.softDelete(id);
  }
}
