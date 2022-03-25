import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { SEQUENCE_REDIS } from './constants';

@Injectable()
export class SequenceService {
  @Inject(SEQUENCE_REDIS)
  private redis: Redis;

  getNext(orgId: number, name: string): Promise<number> {
    const sequenceKey = `org:${orgId}:seq:${name}`;
    return this.redis.incr(sequenceKey);
  }
}
