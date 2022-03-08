import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateOrganizationDto {
  @Length(1, 255)
  @IsString()
  name: string;

  @Length(0, 255)
  @IsString()
  @IsOptional()
  description?: string;

  // Ref: https://stackoverflow.com/questions/7930751/regexp-for-subdomain
  // But no capitals
  @Matches(/^[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?$/, {
    message: 'invalid domain',
  })
  @IsString()
  @IsOptional()
  subdomain?: string;
}
