import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

export const CreateTicketSchema = z.object({
  requesterId: z.number().optional(),
  categoryId: z.number(),
  title: z.string(),
  content: z.string(),
});

export class CreateTicketDto extends createZodDto(CreateTicketSchema) {}
