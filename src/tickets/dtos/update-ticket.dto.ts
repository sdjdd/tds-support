import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { CreateTicketSchema } from './create-ticket.dto';

export const UpdateTicketSchema = CreateTicketSchema.omit({
  authorId: true,
})
  .partial()
  .extend({
    assigneeId: z.number().optional(),
  });

export class UpdateTicketDto extends createZodDto(UpdateTicketSchema) {}
