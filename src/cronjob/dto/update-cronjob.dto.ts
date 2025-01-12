import { IsString, IsDate, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

export class UpdateCronJobDto {
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsNotEmpty()
  @IsString()
  link?: string;

  apiKey?: string;

  @IsNotEmpty()
  @IsString()
  schedule?: string; // e.g., '1h', '2d', '1w'

  @IsNotEmpty()
  @IsString()
  startDate?: Date | string;

  @IsArray()
  @IsOptional()
  webhooks?: string[];
}
