import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { ExcludeNullInterceptor } from '@/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transformOptions: {
        // 目前只有 page / pageSize 用到了，也许使用显示类型转换更好
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(
    new ExcludeNullInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );
  await app.listen(3000);
}
bootstrap();
