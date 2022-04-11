import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { UserRole } from '../types';

function castInt(value: unknown) {
  if (typeof value === 'string') {
    return parseInt(value);
  }
}

const roleNames = {
  'end-user': UserRole.EndUser,
  agent: UserRole.Agent,
  admin: UserRole.Admin,
};

export const UserRoleSchema = z
  .enum(Object.keys(roleNames) as [string, ...string[]])
  .transform<number>((name) => roleNames[name]);

export const FindUsersSchema = z.object({
  page: z.preprocess(castInt, z.number().positive().default(1)),
  pageSize: z.preprocess(castInt, z.number().positive().max(100).default(100)),
  role: z.union([UserRoleSchema, z.array(UserRoleSchema)]).optional(),
});

export class FindUsersParams extends createZodDto(FindUsersSchema) {}
