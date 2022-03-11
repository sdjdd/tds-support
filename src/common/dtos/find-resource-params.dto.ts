import { BadRequestException } from '@nestjs/common';
import { IsOptional, IsPositive } from 'class-validator';

export class FindResourceParams {
  @IsPositive()
  @IsOptional()
  page?: number;

  @IsPositive()
  pageSize?: number = 100;

  @IsPositive()
  @IsOptional()
  cursor?: number;

  get take() {
    return this.pageSize;
  }

  get skip() {
    if (this.page) {
      if (this.cursor) {
        throw new BadRequestException('cannot set both page and cursor');
      }
      return (this.page - 1) * this.pageSize;
    }
  }
}
