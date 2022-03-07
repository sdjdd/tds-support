import { IsOptional, IsString, Length } from 'class-validator';

export class CreateOrganizationDto {
  @Length(1, 255)
  @IsString()
  name: string;

  @Length(0, 255)
  @IsString()
  @IsOptional()
  description?: string;
}
