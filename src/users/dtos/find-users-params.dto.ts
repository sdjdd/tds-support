import { IsIn, IsInt, IsOptional, IsPositive } from 'class-validator';
import { ToInt } from '@/common/transformers';
import { USER_ROLES } from '../constants';
import { UserRole } from '../types';

export class FindUsersParams {
  @IsPositive()
  @IsInt()
  @IsOptional()
  @ToInt()
  page = 1;

  @IsPositive()
  @IsInt()
  @ToInt()
  pageSize = 100;

  @IsIn(USER_ROLES, { each: true })
  @IsOptional()
  role?: UserRole | UserRole[];
}
