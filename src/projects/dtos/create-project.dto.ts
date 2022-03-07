import { IsOptional, IsString, Length } from 'class-validator';

export class CreateProjectDto {
  @Length(1, 255)
  @IsString()
  name: string;

  @Length(0, 255)
  @IsString()
  @IsOptional()
  description?: string;
}
