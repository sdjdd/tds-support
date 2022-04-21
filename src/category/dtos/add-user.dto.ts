import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

export const AddUserSchema = z.object({
  id: z.number().int(),
});

export class AddUserDto extends createZodDto(AddUserSchema) {}
