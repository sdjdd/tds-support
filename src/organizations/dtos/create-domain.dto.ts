import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const DOMAIN_REGEX = /^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*.)+[a-zA-Z]{2,}$/;

export const CreateDomainSchema = z.object({
  domain: z
    .string()
    .regex(DOMAIN_REGEX, {
      message: 'Invalid domain',
    })
    .transform((s) => s.toLowerCase()),
});

export class CreateDomainDto extends createZodDto(CreateDomainSchema) {}
