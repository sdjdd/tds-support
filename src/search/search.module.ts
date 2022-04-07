import { FactoryProvider, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import { ES_CLIENT } from './constants';

const esClientFactory: FactoryProvider = {
  provide: ES_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return new Client({
      node: configService.get('elasticsearch.url'),
    });
  },
};

@Module({
  providers: [esClientFactory],
  exports: [esClientFactory],
})
export class SearchModule {}
