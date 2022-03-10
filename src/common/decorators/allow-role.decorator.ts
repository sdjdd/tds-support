import { SetMetadata } from '@nestjs/common';

export const AllowRole = (role: 'agent' | 'admin') =>
  SetMetadata('allowedRole', role);
