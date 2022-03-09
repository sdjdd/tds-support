import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database';
import { OrganizationsModule } from './organizations';
import { UsersModule } from './users';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    OrganizationsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
