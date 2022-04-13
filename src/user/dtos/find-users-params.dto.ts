import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { UserRole } from '../types';
import { PaginationSchema } from '@/common/schemas/pagination.schema';

const roleNames = {
  'end-user': UserRole.EndUser,
  agent: UserRole.Agent,
  admin: UserRole.Admin,
};

export const UserRoleSchema = z
  .enum(Object.keys(roleNames) as [string, ...string[]])
  .transform<number>((name) => roleNames[name]);

export const FindUsersSchema = PaginationSchema.extend({
  role: z.union([UserRoleSchema, z.array(UserRoleSchema)]).optional(),
});

export class FindUsersParams extends createZodDto(FindUsersSchema) {}
