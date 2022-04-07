import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { USER_ROLES } from '../constants';
import { CreateUserSchema } from './create-user.dto';

export const UpdateUserSchema = CreateUserSchema.pick({
  email: true,
}).extend({
  role: z.enum(USER_ROLES).optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
