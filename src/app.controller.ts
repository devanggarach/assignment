import * as crypto from 'crypto';
import { validate as isValidUUID } from 'uuid';
import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthenticatedUser, Public, Roles, Unprotected } from 'nest-keycloak-connect';

import { AppService } from './app.service';
import { ThrottlerUserGuard } from './guards/throttler-user.guard';
import { RequestId } from './utils';
import { Throttle } from '@nestjs/throttler';
import { RATE_LIMIT } from './config/config.token';

@Controller()
@ApiBearerAuth('Auth0')
@UseGuards(ThrottlerUserGuard)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/all')
  @Public()
  @Throttle(RATE_LIMIT.NORMAL.LIMIT, RATE_LIMIT.NORMAL.SECOND)
  getAll(@RequestId() traceId: string): { traceId: string; message: string } {
    return { traceId, message: `Assignment is Live` };
  }
}
