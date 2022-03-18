import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { CreateCategorySchema } from './create-category.dto';

export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  parentId: CreateCategorySchema.shape.parentId.nullable(),
  active: z.boolean().optional(),
});

export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}
