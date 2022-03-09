import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';

export class CreateDomainDto {
  @Matches(/^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*.)+[a-zA-Z]{2,}$/, {
    message: 'invalid domain',
  })
  @IsString()
  @Transform(({ value }) => value.toLowerCase())
  domain: string;
}
