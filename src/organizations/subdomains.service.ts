import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubdomainDto } from './dtos/create-subdomain.dto';
import { Subdomain } from './entities/subdomain.entity';
import { OrganizationsService } from './organizations.service';

@Injectable()
export class SubdomainsService {
  @InjectRepository(Subdomain)
  private subdomainRepository: Repository<Subdomain>;

  constructor(private organizationsService: OrganizationsService) {}

  findOneBySubdomain(subdomain: string): Promise<Subdomain | undefined> {
    return this.subdomainRepository.findOne({ subdomain });
  }

  async create(
    organizationId: number,
    data: CreateSubdomainDto,
  ): Promise<Subdomain> {
    const organization = await this.organizationsService.findOneOrFail(
      organizationId,
    );
    let subdomain = await this.findOneBySubdomain(data.subdomain);
    if (subdomain) {
      throw new ConflictException(
        `subdomain "${data.subdomain}" already exists`,
      );
    }
    subdomain = new Subdomain();
    subdomain.organization = organization;
    subdomain.organization_id = organization.id;
    subdomain.subdomain = data.subdomain;
    await this.subdomainRepository.insert(subdomain);
    return subdomain;
  }

  async find(organizationId: number): Promise<Subdomain[]> {
    await this.organizationsService.findOneOrFail(organizationId);
    return this.subdomainRepository.find({ organization_id: organizationId });
  }

  async delete(organizationId: number, subdomainId: number) {
    await this.organizationsService.findOneOrFail(organizationId);
    const subdomain = await this.subdomainRepository.findOne({
      organization_id: organizationId,
      id: subdomainId,
    });
    if (!subdomain) {
      throw new NotFoundException(`subdomain ${subdomainId} does not exist`);
    }
    await this.subdomainRepository.delete({
      organization_id: organizationId,
      id: subdomainId,
    });
  }
}
