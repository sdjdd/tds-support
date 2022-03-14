import { IsEmail, IsOptional, IsString, Length } from 'class-validator';
import { Trim } from '@/common/transformers';

export class CreateUserDto {
  @Length(1, 32)
  @IsString()
  @Trim()
  username: string;

  @Length(6, 64)
  @IsString()
  password: string;

  @IsEmail()
  @IsString()
  @IsOptional()
  email?: string;
}
