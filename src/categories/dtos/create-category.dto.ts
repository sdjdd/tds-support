import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

export const CreateCategorySchema = z.object({
  parentId: z.number().int().optional(),
  name: z.string().max(20),
  description: z.string().max(255).optional(),
});

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}
