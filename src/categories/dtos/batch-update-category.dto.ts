import { IsInt } from 'class-validator';
import { UpdateCategoryDto } from './update-category-dto';

export class BatchUpdateCategoryDto extends UpdateCategoryDto {
  @IsInt()
  id: number;
}
