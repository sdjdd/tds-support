import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { cacheConfig, sequenceConfig } from './config/redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { CacheModule } from './cache';
import { DatabaseModule } from './database';
import { OrganizationsModule } from './organizations';
import { UsersModule } from './users';
import { CategoriesModule } from './categories';
import { SequenceModule } from './sequence';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [cacheConfig, sequenceConfig],
    }),
    CacheModule,
    DatabaseModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    CategoriesModule,
    SequenceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
