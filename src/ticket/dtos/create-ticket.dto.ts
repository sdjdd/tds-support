import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

export const CreateTicketSchema = z.object({
  requesterId: z.number().int().optional(),
  categoryId: z.number().int(),
  title: z.string().max(50),
  content: z.string(),
});

export class CreateTicketDto extends createZodDto(CreateTicketSchema) {}
