import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CronJobService } from './cronjob.service';
import { CronJobController } from './cronjob.controller';
import { CronJob, CronJobSchema } from './cronjob.schema';
import { CronJobHistory, CronJobHistorySchema } from './history.schema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    // Register Mongoose schemas
    MongooseModule.forFeature([
      { name: CronJob.name, schema: CronJobSchema },
      { name: CronJobHistory.name, schema: CronJobHistorySchema },
    ]),
    AuthModule,
  ],
  controllers: [CronJobController],
  providers: [CronJobService],
  exports: [CronJobService], // Export the service if it's needed in other modules
})
export class CronJobModule {}
