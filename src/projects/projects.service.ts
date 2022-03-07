import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dtos/create-project.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  @InjectRepository(Project)
  private projectRepository: Repository<Project>;

  async create(data: CreateProjectDto): Promise<Project> {
    const project = new Project();
    project.name = data.name;
    project.description = data.description ?? '';

    await this.projectRepository.insert(project);
    return project;
  }

  find(): Promise<Project[]> {
    return this.projectRepository.find();
  }

  async findOneOrFail(id: number): Promise<Project> {
    const project = await this.projectRepository.findOne(id);
    if (!project) {
      throw new NotFoundException(`tenant ${id} does not exist`);
    }
    return project;
  }

  async update(id: number, data: UpdateProjectDto) {
    await this.findOneOrFail(id);
    await this.projectRepository.update(id, data);
  }

  async softDelete(id: number) {
    await this.findOneOrFail(id);
    await this.projectRepository.softDelete(id);
  }
}
