import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database';
import { ProjectsModule } from './projects';

@Module({
  imports: [DatabaseModule, ProjectsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
