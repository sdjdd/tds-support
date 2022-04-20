import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { OrganizationMiddleware } from './common';
import { configs } from './config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth';
import { CacheModule } from './cache';
import { DatabaseModule } from './database';
import { OrganizationModule } from './organization';
import { UserModule } from './user';
import { CategoryModule } from './category';
import { SequenceModule } from './sequence';
import { TicketModule } from './ticket';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: configService.get('queue'),
      }),
    }),
    CacheModule,
    DatabaseModule,
    AuthModule,
    OrganizationModule,
    UserModule,
    CategoryModule,
    SequenceModule,
    TicketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const versions = ['v1'];
    const paths = ['categories', 'tickets', 'users'];
    versions.forEach((version) => {
      paths.forEach((path) => {
        consumer.apply(OrganizationMiddleware).forRoutes(`${version}/${path}`);
      });
    });
  }
}
