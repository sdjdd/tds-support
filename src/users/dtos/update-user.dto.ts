import { PickType } from '@nestjs/mapped-types';
import { IsIn, IsOptional } from 'class-validator';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PickType(CreateUserDto, ['email']) {
  @IsIn(['end-user', 'agent', 'admin'])
  @IsOptional()
  role?: User['role'];
}
