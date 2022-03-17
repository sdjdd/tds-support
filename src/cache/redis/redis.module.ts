import { FactoryProvider, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CACHE } from './constants';

export const redisFactory: FactoryProvider = {
  provide: REDIS_CACHE,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new Redis(configService.get('cache.url'));
  },
};

@Global()
@Module({
  providers: [redisFactory],
  exports: [REDIS_CACHE],
})
export class RedisModule {}
