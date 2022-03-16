import { IsEmail, IsOptional, Length } from 'class-validator';
import { Trim } from '@/common/transformers';

export class CreateUserDto {
  @Length(1, 32)
  @Trim()
  username: string;

  @Length(6, 64)
  password: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}
