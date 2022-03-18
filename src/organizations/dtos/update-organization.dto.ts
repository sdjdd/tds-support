import { createZodDto } from '@anatine/zod-nestjs';
import { CreateOrganizationSchema } from './create-organization.dto';

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();

export class UpdateOrganizationDto extends createZodDto(
  UpdateOrganizationSchema,
) {}
