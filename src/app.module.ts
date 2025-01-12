import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerUserGuard } from './guards/throttler-user.guard';
import { MongooseModule } from '@nestjs/mongoose';

import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

import commonConfig from './config/common.config';
import serverConfig from './config/server.config';
import { AuthModule } from './auth/auth.module';
import { CronJobModule } from './cronjob/cronjob.module';

const customImportModule: any = [
  AuthModule,
  CronJobModule,
  ConfigModule.forRoot({
    isGlobal: true,
    load: [commonConfig, serverConfig],
  }),
  ServeStaticModule.forRoot({
    rootPath: join(__dirname, 'Public'),
    serveRoot: '/static',
  }),
  ThrottlerModule.forRoot({
    ttl: 60,
    limit: 0,
  }),
  MongooseModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: async (config: ConfigService) => ({
      uri: 'mongodb://0.0.0.0:27017/',
      dbName: 'cronjob',
    }),
    inject: [ConfigService],
  }),
];

const customProvider: any = [
  {
    provide: APP_GUARD,
    useClass: ThrottlerUserGuard,
  },
  AppService,
];
@Module({
  controllers: [AppController],
  providers: customProvider,
  imports: customImportModule,
})
export class AppModule {}
