import { IsString, Matches } from 'class-validator';

export class CreateSubdomainDto {
  @Matches(/^[a-z0-9_-]+$/i)
  @IsString()
  subdomain: string;
}
