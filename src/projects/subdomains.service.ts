import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubdomainDto } from './dtos/create-subdomain.dto';
import { Subdomain } from './entities/subdomain.entity';
import { ProjectsService } from './projects.service';

@Injectable()
export class SubdomainsService {
  @InjectRepository(Subdomain)
  private subdomainRepository: Repository<Subdomain>;

  constructor(private projectsService: ProjectsService) {}

  findOneBySubdomain(subdomain: string): Promise<Subdomain | undefined> {
    return this.subdomainRepository.findOne({ subdomain });
  }

  async create(
    projectId: number,
    data: CreateSubdomainDto,
  ): Promise<Subdomain> {
    const project = await this.projectsService.findOneOrFail(projectId);
    let subdomain = await this.findOneBySubdomain(data.subdomain);
    if (subdomain) {
      throw new ConflictException(
        `subdomain "${data.subdomain}" already exists`,
      );
    }
    subdomain = new Subdomain();
    subdomain.project = project;
    subdomain.project_id = project.id;
    subdomain.subdomain = data.subdomain;
    await this.subdomainRepository.insert(subdomain);
    return subdomain;
  }

  async find(projectId: number): Promise<Subdomain[]> {
    await this.projectsService.findOneOrFail(projectId);
    return this.subdomainRepository.find({ project_id: projectId });
  }

  async delete(projectId: number, subdomainId: number) {
    await this.projectsService.findOneOrFail(projectId);
    const subdomain = await this.subdomainRepository.findOne({
      project_id: projectId,
      id: subdomainId,
    });
    if (!subdomain) {
      throw new NotFoundException(`subdomain ${subdomainId} does not exist`);
    }
    await this.subdomainRepository.delete({
      project_id: projectId,
      id: subdomainId,
    });
  }
}
