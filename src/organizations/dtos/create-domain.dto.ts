import { Matches } from 'class-validator';
import { ToLowerCase } from '@/common/transformers';

export class CreateDomainDto {
  @Matches(/^([a-zA-Z0-9]+(-[a-zA-Z0-9]+)*.)+[a-zA-Z]{2,}$/, {
    message: 'invalid domain',
  })
  @ToLowerCase()
  domain: string;
}
