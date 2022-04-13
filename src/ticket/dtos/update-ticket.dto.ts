import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { CreateTicketSchema } from './create-ticket.dto';

export const UpdateTicketSchema = CreateTicketSchema.pick({
  categoryId: true,
  title: true,
  content: true,
})
  .partial()
  .extend({
    assigneeId: z.number().int().optional(),
  });

export class UpdateTicketDto extends createZodDto(UpdateTicketSchema) {}
