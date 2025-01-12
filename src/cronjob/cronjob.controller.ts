import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { CronJobService } from './cronjob.service';
import { CreateCronJobDto, UpdateCronJobDto, WebhookDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { Throttle } from '@nestjs/throttler';
import { RATE_LIMIT } from 'src/config/config.token';
import { COMMON_RESPONSE_CODE, COMMON_RESPONSE_MESSAGE } from 'src/utils/common.response';
import { RequestId } from 'src/utils';

@Controller('cronjob')
@UseGuards(JwtStrategy)
export class CronJobController {
  logger = new Logger('CronJobController');
  constructor(private readonly cronJobService: CronJobService) {}

  @ApiTags('Create')
  @Post()
  @Throttle(RATE_LIMIT.NORMAL.LIMIT, RATE_LIMIT.NORMAL.SECOND)
  async create(@RequestId() traceId: string, @Body() createCronJobDto: CreateCronJobDto) {
    try {
      return { traceId, data: await this.cronJobService.createCronJob(traceId, createCronJobDto) };
    } catch (error) {
      this.logger.error({ traceId, error, status: error?.status, response: error?.response }, 'error');
      throw new HttpException(
        {
          traceId,
          code: error?.response?.code ?? COMMON_RESPONSE_CODE.INTERNAL_SERVER_ERROR,
          message: error?.response?.message ?? COMMON_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
          status:
            error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiTags('Webhook')
  @Post('webhook')
  @Throttle(RATE_LIMIT.NORMAL.LIMIT, RATE_LIMIT.NORMAL.SECOND)
  async createWebhook(@RequestId() traceId: string, @Body() webhookDto: WebhookDto) {
    try {
      return { traceId, data: await this.cronJobService.createWebhook(traceId, webhookDto) };
    } catch (error) {
      this.logger.error({ traceId, error, status: error?.status, response: error?.response }, 'error');
      throw new HttpException(
        {
          traceId,
          code: error?.response?.code ?? COMMON_RESPONSE_CODE.INTERNAL_SERVER_ERROR,
          message: error?.response?.message ?? COMMON_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
          status:
            error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiTags('List CronJobs')
  @Get()
  @Throttle(RATE_LIMIT.NORMAL.LIMIT, RATE_LIMIT.NORMAL.SECOND)
  async getAll(@RequestId() traceId: string) {
    try {
      return { traceId, data: await this.cronJobService.getAllCronJobs(traceId) };
    } catch (error) {
      this.logger.error({ traceId, error, status: error?.status, response: error?.response }, 'error');
      throw new HttpException(
        {
          traceId,
          code: error?.response?.code ?? COMMON_RESPONSE_CODE.INTERNAL_SERVER_ERROR,
          message: error?.response?.message ?? COMMON_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
          status:
            error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiTags('History of CronJob')
  @Get('history/:id')
  @Throttle(RATE_LIMIT.NORMAL.LIMIT, RATE_LIMIT.NORMAL.SECOND)
  async getHistory(@RequestId() traceId: string, @Param('id') id: string) {
    try {
      return { traceId, data: await this.cronJobService.getCronJobHistory(traceId, id) };
    } catch (error) {
      this.logger.error({ traceId, error, status: error?.status, response: error?.response }, 'error');
      throw new HttpException(
        {
          traceId,
          code: error?.response?.code ?? COMMON_RESPONSE_CODE.INTERNAL_SERVER_ERROR,
          message: error?.response?.message ?? COMMON_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
          status:
            error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiTags('Update CronJob')
  @Put(':id')
  @Throttle(RATE_LIMIT.NORMAL.LIMIT, RATE_LIMIT.NORMAL.SECOND)
  async update(@RequestId() traceId: string, @Param('id') id: string, @Body() updateCronJobDto: UpdateCronJobDto) {
    try {
      return { traceId, data: await this.cronJobService.updateCronJob(traceId, id, updateCronJobDto) };
    } catch (error) {
      this.logger.error({ traceId, error, status: error?.status, response: error?.response }, 'error');
      throw new HttpException(
        {
          traceId,
          code: error?.response?.code ?? COMMON_RESPONSE_CODE.INTERNAL_SERVER_ERROR,
          message: error?.response?.message ?? COMMON_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
          status:
            error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiTags('Delete CronJob')
  @Delete(':id')
  @Throttle(RATE_LIMIT.NORMAL.LIMIT, RATE_LIMIT.NORMAL.SECOND)
  async delete(@RequestId() traceId: string, @Param('id') id: string) {
    try {
      return { traceId, ...(await this.cronJobService.deleteCronJob(traceId, id)) };
    } catch (error) {
      this.logger.error({ traceId, error, status: error?.status, response: error?.response }, 'error');
      throw new HttpException(
        {
          traceId,
          code: error?.response?.code ?? COMMON_RESPONSE_CODE.INTERNAL_SERVER_ERROR,
          message: error?.response?.message ?? COMMON_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
          status:
            error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
