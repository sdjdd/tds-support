import { IsInt, IsOptional, IsPositive } from 'class-validator';

export class PaginationDto {
  @IsPositive()
  @IsInt()
  @IsOptional()
  page?: number;

  @IsPositive()
  @IsInt()
  @IsOptional()
  pageSize?: number = 100;
}
