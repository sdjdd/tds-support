import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

export const CreateUserSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(6).max(255),
  email: z.string().email().optional(),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
