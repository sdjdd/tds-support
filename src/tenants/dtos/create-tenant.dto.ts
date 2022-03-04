import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateTenantDto {
  @Matches(/^[a-z0-9_-]+$/i)
  @Length(1, 20)
  @IsString()
  subdomain: string;

  @Length(1, 255)
  @IsString()
  name: string;

  @Length(0, 255)
  @IsString()
  @IsOptional()
  description?: string;
}
