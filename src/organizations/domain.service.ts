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
export class DomainService {
  @InjectRepository(Domain)
  private domainRepository: Repository<Domain>;

  constructor(private organizationsService: OrganizationsService) {}

  findOneByDomain(domain: string): Promise<Domain | undefined> {
    return this.domainRepository.findOne({ domain });
  }

  async create(orgId: number, data: CreateDomainDto): Promise<number> {
    await this.organizationsService.findOneOrFail(orgId);
    let domain = await this.findOneByDomain(data.domain);
    if (domain) {
      throw new ConflictException(`domain "${data.domain}" already exists`);
    }
    domain = new Domain();
    domain.orgId = orgId;
    domain.domain = data.domain;
    await this.domainRepository.insert(domain);
    return domain.id;
  }

  async find(orgId: number): Promise<Domain[]> {
    await this.organizationsService.findOneOrFail(orgId);
    return this.domainRepository.find({ orgId });
  }

  findOne(orgId: number, id: number): Promise<Domain | undefined> {
    return this.domainRepository.findOne({ orgId, id });
  }

  async delete(orgId: number, id: number) {
    await this.organizationsService.findOneOrFail(orgId);
    const domain = await this.domainRepository.findOne({ orgId, id });
    if (!domain) {
      throw new NotFoundException(`domain ${id} does not exist`);
    }
    await this.domainRepository.delete({ orgId, id });
  }
}
