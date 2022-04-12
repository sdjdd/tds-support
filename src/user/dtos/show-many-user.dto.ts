import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import _ from 'lodash';

export const ShowManyUserSchema = z.object({
  ids: z.preprocess((value: string) => {
    return value.split(',').map((str) => parseInt(str));
  }, z.array(z.number().int()).max(100).transform(_.uniq)),
});

export class ShowManyUserDto extends createZodDto(ShowManyUserSchema) {}
