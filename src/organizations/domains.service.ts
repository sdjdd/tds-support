import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDomainDto } from './dtos/create-domain.dto';
import { Domain } from './entities/domain.entity';
import { OrganizationsService } from './organizations.service';

@Injectable()
export class DomainsService {
  @InjectRepository(Domain)
  private domainsRepository: Repository<Domain>;

  constructor(private organizationsService: OrganizationsService) {}

  findOneByDomain(domain: string): Promise<Domain | undefined> {
    return this.domainsRepository.findOne({ domain });
  }

  async create(organizationId: number, data: CreateDomainDto): Promise<number> {
    await this.organizationsService.findOneOrFail(organizationId);
    let domain = await this.findOneByDomain(data.domain);
    if (domain) {
      throw new ConflictException(`domain "${data.domain}" already exists`);
    }
    domain = new Domain();
    domain.organizationId = organizationId;
    domain.domain = data.domain;
    await this.domainsRepository.insert(domain);
    return domain.id;
  }

  async find(organizationId: number): Promise<Domain[]> {
    await this.organizationsService.findOneOrFail(organizationId);
    return this.domainsRepository.find({ organizationId });
  }

  findOne(organizationId: number, id: number): Promise<Domain | undefined> {
    return this.domainsRepository.findOne({ organizationId, id });
  }

  async delete(organizationId: number, id: number) {
    await this.organizationsService.findOneOrFail(organizationId);
    const domain = await this.domainsRepository.findOne({ organizationId, id });
    if (!domain) {
      throw new NotFoundException(`domain ${id} does not exist`);
    }
    await this.domainsRepository.delete({ organizationId, id });
  }
}
