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

export const cacheConfig = registerAs('cache', () =>
  parseRedisUrl(process.env.REDIS_URL_CACHE),
);
