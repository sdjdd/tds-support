import { URL } from 'url';
import { registerAs } from '@nestjs/config';

function parseRedisUrl(redisUrl: string) {
  const { password, hostname, port } = new URL(redisUrl);
  return {
    host: hostname,
    port: parseInt(port),
    password,
  };
}

export const cacheConfig = registerAs('cache', () => {
  const url = process.env.REDIS_URL_CACHE;
  return {
    ...parseRedisUrl(url),
    url,
  };
});

export const queueConfig = registerAs('queue', () => {
  const url = process.env.REDIS_URL_QUEUE;
  return {
    ...parseRedisUrl(url),
    url,
  };
});

export const sequenceConfig = registerAs('sequence', () => ({
  url: process.env.REDIS_URL_QUEUE,
}));
