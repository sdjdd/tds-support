import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import redisStore from 'cache-manager-ioredis';
import { cacheConfig } from './config/redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { DatabaseModule } from './database';
import { OrganizationsModule } from './organizations';
import { UsersModule } from './users';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [cacheConfig],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('cache.host'),
        port: configService.get('cache.port'),
        password: configService.get('cache.password'),
      }),
    }),
    DatabaseModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
