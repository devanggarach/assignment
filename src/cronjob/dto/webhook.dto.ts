import { IsString, IsDate } from 'class-validator';

export class WebhookDto {
  @IsString()
  cronJobId: string; // Cron Job associated with the webhook
  data?: any;
  status?: number;
}
