import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { cacheConfig } from './config/redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { CacheModule } from './cache';
import { DatabaseModule } from './database';
import { OrganizationsModule } from './organizations';
import { UsersModule } from './users';
import { CategoriesModule } from './categories';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [cacheConfig],
    }),
    CacheModule,
    DatabaseModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    CategoriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
