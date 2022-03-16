import { PickType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { USER_ROLES } from '../constants';
import { UserRole } from '../types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PickType(CreateUserDto, ['email']) {
  @IsIn(USER_ROLES)
  @IsOptional()
  role?: UserRole;
}
