import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { PaginationSchema } from '@/common/schemas/pagination.schema';

const ORDER_FIELDS = ['id', 'updatedAt', 'status'] as const;

export const FindTicketsSchema = PaginationSchema.extend({
  orderBy: z
    .enum([...ORDER_FIELDS, ...ORDER_FIELDS.map((field) => '-' + field)])
    .transform<[string, 'ASC' | 'DESC']>((field) => {
      const desc = field.startsWith('-');
      if (desc) {
        field = field.slice(1);
      }
      if (field === 'id') {
        field = 'seq';
      }
      return [field, desc ? 'DESC' : 'ASC'];
    })
    .optional(),
});

export class FindTicketsDto extends createZodDto(FindTicketsSchema) {}
