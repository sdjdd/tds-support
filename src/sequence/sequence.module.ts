import { FactoryProvider, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { SEQUENCE_REDIS } from './constants';
import { SequenceService } from './sequence.service';

const redisFactory: FactoryProvider = {
  provide: SEQUENCE_REDIS,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new Redis(configService.get('sequence.url'));
  },
};

@Module({
  providers: [redisFactory, SequenceService],
  exports: [SequenceService],
})
export class SequenceModule {}
