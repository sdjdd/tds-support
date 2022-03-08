import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrganizationDto } from './dtos/create-organization.dto';
import { UpdateOrganizationDto } from './dtos/update-organization.dto';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  @InjectRepository(Organization)
  private organizationsRepository: Repository<Organization>;

  async create(data: CreateOrganizationDto): Promise<Organization> {
    const organization = new Organization();
    organization.name = data.name;
    organization.description = data.description ?? '';

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

  async update(id: number, data: UpdateOrganizationDto) {
    await this.findOneOrFail(id);
    await this.organizationsRepository.update(id, data);
  }

  async softDelete(id: number) {
    await this.findOneOrFail(id);
    await this.organizationsRepository.softDelete(id);
  }
}
