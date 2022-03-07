import { IsString, Matches } from 'class-validator';

export class CreateSubdomainDto {
  // Ref: https://stackoverflow.com/questions/7930751/regexp-for-subdomain
  // But no capitals
  @Matches(/^[a-z0-9](?:[a-z0-9\-]{0,61}[a-z0-9])?$/, {
    message: 'invalid subdomain',
  })
  @IsString()
  subdomain: string;
}
