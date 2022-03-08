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
  private subdomainsRepository: Repository<Subdomain>;

  constructor(private organizationsService: OrganizationsService) {}

  findOneBySubdomain(subdomain: string): Promise<Subdomain | undefined> {
    return this.subdomainsRepository.findOne({ subdomain });
  }

  async create(
    organizationId: number,
    data: CreateSubdomainDto,
  ): Promise<Subdomain> {
    await this.organizationsService.findOneOrFail(organizationId);
    let subdomain = await this.findOneBySubdomain(data.subdomain);
    if (subdomain) {
      throw new ConflictException(
        `subdomain "${data.subdomain}" already exists`,
      );
    }
    subdomain = new Subdomain();
    subdomain.organizationId = organizationId;
    subdomain.subdomain = data.subdomain;
    await this.subdomainsRepository.insert(subdomain);
    return subdomain;
  }

  async find(organizationId: number): Promise<Subdomain[]> {
    await this.organizationsService.findOneOrFail(organizationId);
    return this.subdomainsRepository.find({ organizationId });
  }

  async delete(organizationId: number, subdomainId: number) {
    await this.organizationsService.findOneOrFail(organizationId);
    const subdomain = await this.subdomainsRepository.findOne({
      organizationId,
      id: subdomainId,
    });
    if (!subdomain) {
      throw new NotFoundException(`subdomain ${subdomainId} does not exist`);
    }
    await this.subdomainsRepository.delete({
      organizationId,
      id: subdomainId,
    });
  }
}
