import common from './common';
import elasticsearch from './elasticsearch';
import { cacheConfig, queueConfig, sequenceConfig } from './redis';

export const configs = [
  common,
  elasticsearch,
  cacheConfig,
  queueConfig,
  sequenceConfig,
];
