import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database';
import { TenantsModule } from './tenants';

@Module({
  imports: [DatabaseModule, TenantsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
