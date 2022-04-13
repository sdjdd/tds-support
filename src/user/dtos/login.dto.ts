import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

export const LoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export class LoginDto extends createZodDto(LoginSchema) {}
