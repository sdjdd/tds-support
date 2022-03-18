import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { UpdateCategorySchema } from './update-category-dto';

export const BatchUpdateCategorySchema = z.object({
  categories: z.array(
    UpdateCategorySchema.extend({
      id: z.number(),
    }),
  ),
});

export class BatchUpdateCategoryDto extends createZodDto(
  BatchUpdateCategorySchema,
) {}
