import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsInt()
  @IsOptional()
  parentId?: number;

  @Length(1, 20)
  @IsString()
  name: string;

  @MaxLength(255)
  @IsString()
  @IsOptional()
  description?: string;
}
