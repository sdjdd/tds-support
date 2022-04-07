import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { USER_ROLES } from '../constants';

function castInt(value: unknown) {
  if (typeof value === 'string') {
    return parseInt(value);
  }
}

export const FindUsersSchema = z.object({
  page: z.preprocess(castInt, z.number().positive().default(1)),
  pageSize: z.preprocess(castInt, z.number().positive().max(100).default(100)),
  role: z
    .enum(USER_ROLES)
    .or(z.array(z.enum(USER_ROLES)))
    .optional(),
});

export class FindUsersParams extends createZodDto(FindUsersSchema) {}
