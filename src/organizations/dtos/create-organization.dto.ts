import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { ToLowerCase } from '@/common/transformers';

export class CreateOrganizationDto {
  @Length(1, 255)
  @IsString()
  name: string;

  @Length(0, 255)
  @IsString()
  @IsOptional()
  description?: string;

  // https://stackoverflow.com/questions/7930751/regexp-for-subdomain
  @Matches(/[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?/, {
    message: 'invalid subdomain',
  })
  @IsString()
  @IsOptional()
  @ToLowerCase()
  subdomain?: string;
}
