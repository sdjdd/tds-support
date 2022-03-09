import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { default as config } from './ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...config,
      autoLoadEntities: true,
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
