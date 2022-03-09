import { IsEmail, IsIn, IsOptional, IsString, Length } from 'class-validator';
import { Trim } from '@/common/transformers';
import { User } from '../entities/user.entity';

export class CreateUserDto {
  @Length(1, 32)
  @IsString()
  @Trim()
  username: string;

  @Length(6, 64)
  @IsString()
  @Trim()
  password: string;

  @IsEmail()
  @IsString()
  @IsOptional()
  email?: string;

  @IsIn(['end-user', 'agent', 'admin'])
  @IsOptional()
  role?: User['role'];
}
