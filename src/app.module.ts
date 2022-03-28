import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { OrganizationMiddleware } from './common';
import { cacheConfig, queueConfig, sequenceConfig } from './config/redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { CacheModule } from './cache';
import { DatabaseModule } from './database';
import { OrganizationsModule } from './organizations';
import { UsersModule } from './users';
import { CategoriesModule } from './categories';
import { SequenceModule } from './sequence';
import { TicketsModule } from './tickets';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [cacheConfig, queueConfig, sequenceConfig],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configModule: ConfigService) => {
        return {
          redis: configModule.get('queue'),
        };
      },
    }),
    CacheModule,
    DatabaseModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    CategoriesModule,
    SequenceModule,
    TicketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(OrganizationMiddleware).forRoutes('*');
  }
}
