import { Transform } from 'class-transformer';
import { IsOptional, Length, Matches } from 'class-validator';

export class CreateOrganizationDto {
  @Length(1, 255)
  name: string;

  @Length(0, 255)
  @IsOptional()
  description?: string;

  // https://stackoverflow.com/questions/7930751/regexp-for-subdomain
  @Matches(/[A-Za-z0-9](?:[A-Za-z0-9\-]{0,61}[A-Za-z0-9])?/, {
    message: 'invalid subdomain',
  })
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  subdomain?: string;
}
