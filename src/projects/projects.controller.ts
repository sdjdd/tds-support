import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateProjectDto } from './dtos/create-project.dto';
import { CreateSubdomainDto } from './dtos/create-subdomain.dto';
import { UpdateProjectDto } from './dtos/update-project.dto';
import { ProjectsService } from './projects.service';
import { SubdomainsService } from './subdomains.service';

@Controller({
  host: process.env.ADMIN_DOMAIN,
  path: 'projects',
})
export class ProjectsController {
  constructor(
    private projectsService: ProjectsService,
    private subdomainsService: SubdomainsService,
  ) {}

  @Post()
  create(@Body() data: CreateProjectDto) {
    return this.projectsService.create(data);
  }

  @Get()
  find() {
    return this.projectsService.find();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.projectsService.findOneOrFail(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() data: UpdateProjectDto) {
    await this.projectsService.update(id, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.projectsService.softDelete(id);
  }

  @Post(':id/subdomains')
  createSubdomain(@Param('id') id: number, @Body() data: CreateSubdomainDto) {
    return this.subdomainsService.create(id, data);
  }

  @Get(':id/subdomains')
  findSubdomains(@Param('id') id: number) {
    return this.subdomainsService.find(id);
  }

  @Delete(':id/subdomains/:subdomainId')
  async deleteSubdomain(
    @Param('id') id: number,
    @Param('subdomainId') subdomainId: number,
  ) {
    await this.subdomainsService.delete(id, subdomainId);
  }
}
