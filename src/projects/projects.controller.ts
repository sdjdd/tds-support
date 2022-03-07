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
import { UpdateProjectDto } from './dtos/update-project.dto';
import { ProjectsService } from './projects.service';

@Controller({
  host: process.env.ADMIN_DOMAIN,
  path: 'projects',
})
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

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
}
