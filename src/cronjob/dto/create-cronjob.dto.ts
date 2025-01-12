import { IsString, IsDate, IsArray, IsOptional, IsNotEmpty, isString } from 'class-validator';

export class CreateCronJobDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  link: string;

  apiKey?: string;

  @IsNotEmpty()
  @IsString()
  schedule: string; // e.g., '1h', '2d', '1w'

  @IsNotEmpty()
  @IsString()
  startDate: Date | string;

  @IsArray()
  @IsOptional()
  webhooks?: string[];
}
