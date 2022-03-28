import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configModule: ConfigService) => {
        return {
          redis: configModule.get('queue'),
        };
      },
    }),
  ],
})
export class QueueModule {}
