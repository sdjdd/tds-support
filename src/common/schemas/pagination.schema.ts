import { z } from 'zod';

function castInt(value: any) {
  if (typeof value === 'string') {
    return parseInt(value);
  }
  return value;
}

export const PaginationSchema = z.object({
  page: z.preprocess(castInt, z.number().positive().optional()),
  pageSize: z.preprocess(castInt, z.number().positive().max(100).optional()),
});
