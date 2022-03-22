import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { default as config } from './ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...config,
      autoLoadEntities: true,
      logging: process.env.NODE_ENV !== 'production',
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
