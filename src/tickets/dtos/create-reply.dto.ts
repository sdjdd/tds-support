import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

export const CreateReplySchema = z.object({
  content: z.string(),
  public: z.boolean().optional(),
});

export class CreateReplyDto extends createZodDto(CreateReplySchema) {}
