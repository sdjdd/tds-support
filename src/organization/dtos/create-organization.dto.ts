import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

// link: https://stackoverflow.com/questions/7930751/regexp-for-subdomain
const SUBDOMAIN_REGEX = /[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?/;

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(255).optional(),
  subdomain: z
    .string()
    .regex(SUBDOMAIN_REGEX, {
      message: 'Invalid subdomain',
    })
    .transform((s) => s.toLowerCase())
    .optional(),
});

export class CreateOrganizationDto extends createZodDto(
  CreateOrganizationSchema,
) {}
