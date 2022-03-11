import { FindResourceParams } from '@/common';
import { IsIn, IsOptional } from 'class-validator';
import { USER_ROLES } from '../constants';
import { UserRole } from '../types';

export class FindUsersParams extends FindResourceParams {
  @IsIn(USER_ROLES, { each: true })
  @IsOptional()
  role?: UserRole | UserRole[];
}
