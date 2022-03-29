import { registerAs } from '@nestjs/config';

export const elasticsearchConfig = registerAs('elasticsearch', () => ({
  url: process.env.ELASTICSEARCH_URL_MYES,
}));
