import { Injectable, OnModuleInit, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidV4 } from 'uuid';
import mongoose, { Model, Mongoose } from 'mongoose';
import { CronJob } from './cronjob.schema';
import { CronJobHistory, CronJobHistorySchema } from './history.schema';
import * as cron from 'node-cron';
import { CreateCronJobDto, UpdateCronJobDto, WebhookDto } from './dto';
import { BadRequestException } from '@nestjs/common';
import * as moment from 'moment';
import axios from 'axios';
import { COMMON_RESPONSE_CODE, COMMON_RESPONSE_MESSAGE } from 'src/utils/common.response';

@Injectable()
export class CronJobService implements OnModuleInit {
  private scheduledJobs: Map<string, cron.ScheduledTask> = new Map();
  private delayedJobs: Map<string, NodeJS.Timeout> = new Map();
  commonDateFormat = 'DD-MM-YYYY';
  logger = new Logger('CronJobService');
  constructor(
    @InjectModel(CronJob.name) private cronJobModel: Model<CronJob>,
    @InjectModel(CronJobHistory.name) private cronJobHistoryModel: Model<CronJobHistory>,
  ) {}

  async onModuleInit() {
    const traceId: string = uuidV4();
    try {
      // Fetch all the saved cron jobs from the database
      const cronJobs = await this.cronJobModel.find();
      this.logger.log({ cronJobs }, 'cronjobs');
      // Loop through each saved cron job and reschedule them
      cronJobs.forEach((cronJob) => {
        const currentTime = new Date();
        // Only reschedule cron jobs that have passed their start date
        if (cronJob.startDate <= currentTime) {
          this.scheduleCronJob(traceId, cronJob);
        }
      });
    } catch (error) {
      this.handleError(traceId, error);
    }
  }

  async scheduleCronJob(traceId: string, cronJob: CronJob) {
    try {
      // Stop any previously scheduled job with the same ID
      if (this.scheduledJobs.has(cronJob._id.toString())) {
        this.scheduledJobs.get(cronJob._id.toString()).stop();
        this.scheduledJobs.delete(cronJob._id.toString());
      }

      // Clear any existing delayed job for the same ID
      if (this.delayedJobs.has(cronJob._id.toString())) {
        clearTimeout(this.delayedJobs.get(cronJob._id.toString()));
        this.delayedJobs.delete(cronJob._id.toString());
      }

      const currentTime = new Date();

      // Handle future start date
      if (cronJob.startDate > currentTime) {
        const delay = cronJob.startDate.getTime() - currentTime.getTime();
        this.logger.log(`Cron job ${cronJob.name} will start in ${delay}ms (${cronJob.startDate}).`);

        const timeout = setTimeout(() => {
          this.logger.log(`Starting cron job ${cronJob.name} at the scheduled future date.`);
          this.scheduleCronJob(traceId, cronJob); // Reschedule the job now that the start date has arrived
        }, delay);

        this.delayedJobs.set(cronJob._id.toString(), timeout);
        return;
      }

      // Start the job immediately if the startDate is in the past or present
      const schedule = this.convertScheduleToCronPattern(traceId, cronJob.schedule);
      this.logger.log(`Scheduling cron job: ${cronJob.name} with schedule: ${schedule}`);

      const task = cron.schedule(schedule, async () => {
        this.logger.log(`Executing cron job: ${cronJob.name}`);
        await this.triggerCronJob(traceId, cronJob);
      });

      this.scheduledJobs.set(cronJob._id.toString(), task);

      this.logger.log(`Cron job ${cronJob.name} has been started immediately.`);
    } catch (error) {
      this.handleError(traceId, error);
    }
  }

  private convertScheduleToCronPattern(traceId: string, schedule: string): string {
    try {
      switch (true) {
        case /(\d+)m/.test(schedule): {
          const minutes = schedule.match(/(\d+)m/)[1];
          return `*/${minutes} * * * *`;
        }
        case /(\d+)h/.test(schedule): {
          const hours = schedule.match(/(\d+)h/)[1];
          return `0 */${hours} * * *`;
        }
        case /(\d+)d/.test(schedule): {
          const days = schedule.match(/(\d+)d/)[1];
          return `0 0 */${days} * *`;
        }
        case /weekly/.test(schedule): {
          return `0 0 * * 0`;
        }
        case /monthly/.test(schedule): {
          return `0 0 1 * *`;
        }
        default: {
          return schedule;
        }
      }
    } catch (error) {
      this.handleError(traceId, error);
    }
  }

  async createCronJob(traceId: string, createCronJobDto: CreateCronJobDto) {
    try {
      const { startDate } = createCronJobDto;

      const isValidDate = moment(startDate, this.commonDateFormat).isValid();
      if (!isValidDate) {
        throw new BadRequestException(COMMON_RESPONSE_MESSAGE.INVALID_DATE);
      }

      const parsedDate = moment(startDate, this.commonDateFormat);
      // if (parsedDate.isBefore(moment())) {
      //   throw new BadRequestException(COMMON_RESPONSE_MESSAGE.INVALID_START_DATE_CANNOT_BE_PAST);
      // }

      createCronJobDto.startDate = parsedDate.toDate();

      const cronJob = new this.cronJobModel(createCronJobDto);
      await cronJob.save();

      await this.scheduleCronJob(traceId, cronJob);

      return cronJob;
    } catch (error) {
      this.logger.error({ error }, 'error');
      this.handleError(traceId, error);
    }
  }

  async triggerCronJob(traceId, cronJob: CronJob) {
    try {
      this.logger.log(`Triggered cron job: ${cronJob.name}`);
      let apiUrl: string = cronJob.link;
      if (cronJob?.apiKey) {
        apiUrl += `?apiKey=${cronJob.apiKey}`;
      }

      const params: any = {};
      if (cronJob.apiKey) {
        params.apiKey = cronJob.apiKey;
      }

      const response = await axios(apiUrl, { params });

      const responseData = {
        status: response.status,
        data: response.data,
      };

      // Save the response in the cron job history
      const history = new this.cronJobHistoryModel({
        cronJobId: cronJob._id,
        triggeredAt: new Date(),
        response: responseData,
        status: ['200', '201', 200, 201].includes(response?.status),
      });

      await history.save();
      this.logger.log('Cron job history saved:', history);

      await this.triggerWebhooks(traceId, cronJob);
    } catch (error) {
      this.logger.error({ error }, 'Error triggering cron job');
      this.handleError(traceId, error);
    }
  }

  async triggerWebhooks(traceId: string, cronJob: CronJob) {
    try {
      // Loop through all the webhooks associated with the cron job
      const webhooks = cronJob?.webhooks ?? [];
      for (const webhook of webhooks) {
        this.logger.log(`Triggering webhook for cron job: ${cronJob.name}`);

        // Prepare the data to be sent to the webhook
        const result = await this.cronJobHistoryModel
          .find({ cronJobId: cronJob._id })
          .sort({ _id: -1 })
          .limit(1)
          .lean()
          .exec();
        const webhookData = {
          id: result[0]._id,
          jobName: cronJob.name,
          cronJobId: cronJob._id?.toString(),
          triggeredAt: result[0].triggeredAt,
          status: result[0]?.status ?? 1,
          response: result[0].response,
        };

        await axios.post(webhook, webhookData);

        this.logger.log(`Webhook triggered for: ${webhook}`);
      }
    } catch (error) {
      this.logger.error('Error triggering webhook', error);
      this.handleError(traceId, error);
    }
  }

  async getAllCronJobs(traceId: string) {
    try {
      return await this.cronJobModel.find({}).sort({ _id: -1 }).lean().exec();
    } catch (error) {
      this.logger.error({ error }, 'error');
      this.handleError(traceId, error);
    }
  }

  async getCronJobHistory(traceId: string, cronJobId: string) {
    try {
      return await this.cronJobHistoryModel.find({ cronJobId }).lean().exec();
    } catch (error) {
      this.handleError(traceId, error);
    }
  }

  async updateCronJob(traceId: string, id: string, updateCronJobDto: UpdateCronJobDto) {
    try {
      const { startDate } = updateCronJobDto;

      const isValidDate = moment(startDate, this.commonDateFormat).isValid();
      if (!isValidDate) {
        throw new BadRequestException(COMMON_RESPONSE_MESSAGE.INVALID_DATE);
      }

      const parsedDate = moment(startDate, this.commonDateFormat);

      updateCronJobDto.startDate = parsedDate.toDate();

      const updatedJob = await this.cronJobModel.findByIdAndUpdate(id, updateCronJobDto, { new: true }).exec();

      // Reschedule the job after updating
      await this.scheduleCronJob(traceId, updatedJob);

      return updatedJob;
    } catch (error) {
      this.handleError(traceId, error);
    }
  }

  async deleteCronJob(traceId: string, id: string) {
    try {
      if (this.scheduledJobs.has(id)) {
        this.scheduledJobs.get(id).stop();
        this.scheduledJobs.delete(id);
      }

      if (this.delayedJobs.has(id)) {
        clearTimeout(this.delayedJobs.get(id));
        this.delayedJobs.delete(id);
      }

      const objId = new mongoose.Types.ObjectId(id);
      const result = await this.cronJobModel.findByIdAndDelete(objId).exec();
      if (!result) {
        return { message: COMMON_RESPONSE_CODE.CRON_NOT_EXISTS };
      }
      return { message: COMMON_RESPONSE_MESSAGE.CRON_DELETED };
    } catch (error) {
      this.handleError(traceId, error);
    }
  }

  async createWebhook(traceId: string, webhookDto: WebhookDto) {
    try {
      const objId = new mongoose.Types.ObjectId(webhookDto.cronJobId);
      const cronJob = await this.cronJobModel.findById(objId).lean().exec();
      if (!cronJob) throw new Error(COMMON_RESPONSE_MESSAGE.CRON_JOB_NOT_FOOUND);

      const history = new this.cronJobHistoryModel({
        cronJobId: cronJob._id,
        triggeredAt: new Date(),
        response: webhookDto.data,
        status: ['200', '201', 200, 201].includes(webhookDto?.status ?? 1),
      });
      history.save();

      return { message: COMMON_RESPONSE_MESSAGE.WEBHOOOK_RESPONSE_ADDED };
    } catch (error) {
      this.handleError(traceId, error);
    }
  }

  private handleError(traceId, error: any) {
    this.logger.error({ traceId, error }, 'error'); // You can log it to a more sophisticated logger if needed
    throw new HttpException(
      {
        traceId,
        code: error?.response?.code ?? COMMON_RESPONSE_CODE.INTERNAL_SERVER_ERROR,
        message: error?.response?.message ?? COMMON_RESPONSE_CODE.INTERNAL_SERVER_ERROR,
        status:
          error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      },
      error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
