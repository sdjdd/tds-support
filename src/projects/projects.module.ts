import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Subdomain } from './entities/subdomain.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { SubdomainsService } from './subdomains.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Subdomain])],
  providers: [ProjectsService, SubdomainsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}
