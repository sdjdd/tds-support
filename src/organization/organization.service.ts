import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import _ from 'lodash';
import { CreateOrganizationDto } from './dtos/create-organization.dto';
import { UpdateOrganizationDto } from './dtos/update-organization.dto';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationService {
  @InjectRepository(Organization)
  private organizationRepository: Repository<Organization>;

  private async assertNoSubdomainConflict(subdomain: string) {
    const organization = await this.findOneBySubdomain(subdomain);
    if (organization) {
      throw new ConflictException(`subdomain "${subdomain}" already exists`);
    }
  }

  async create(data: CreateOrganizationDto): Promise<number> {
    if (data.subdomain) {
      await this.assertNoSubdomainConflict(data.subdomain);
    }

    const organization = new Organization();
    organization.name = data.name;
    organization.description = data.description ?? '';
    organization.subdomain = data.subdomain;

    await this.organizationRepository.insert(organization);
    return organization.id;
  }

  find(): Promise<Organization[]> {
    return this.organizationRepository.find();
  }

  findOne(id: number): Promise<Organization | undefined> {
    return this.organizationRepository.findOne(id);
  }

  async findOneOrFail(id: number): Promise<Organization> {
    const organization = await this.findOne(id);
    if (!organization) {
      throw new NotFoundException(`organization ${id} does not exist`);
    }
    return organization;
  }

  findOneBySubdomain(subdomain: string): Promise<Organization | undefined> {
    return this.organizationRepository.findOne({ subdomain });
  }

  async update(id: number, data: UpdateOrganizationDto) {
    const organization = await this.findOneOrFail(id);
    if (_.isEmpty(data)) {
      return;
    }
    if (data.subdomain && organization.subdomain !== data.subdomain) {
      await this.assertNoSubdomainConflict(data.subdomain);
    }
    await this.organizationRepository.update(id, data);
  }

  async softDelete(id: number) {
    await this.findOneOrFail(id);
    await this.organizationRepository.softDelete(id);
  }
}
