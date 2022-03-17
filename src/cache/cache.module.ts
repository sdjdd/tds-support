import { CacheModule as NestCacheModule, Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { RedisModule, redisStore, REDIS_CACHE } from './redis';

@Module({
  imports: [
    RedisModule,
    NestCacheModule.registerAsync({
      isGlobal: true,
      inject: [REDIS_CACHE],
      useFactory: (redis: Redis) => ({
        store: redisStore,
        redisInstance: redis,
      }),
    }),
  ],
})
export class CacheModule {}
