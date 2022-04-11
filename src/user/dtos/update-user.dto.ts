import { createZodDto } from '@anatine/zod-nestjs';
import { CreateUserSchema } from './create-user.dto';
import { UserRoleSchema } from './find-users-params.dto';

export const UpdateUserSchema = CreateUserSchema.pick({
  email: true,
}).extend({
  role: UserRoleSchema.optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
