import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, OpenAPIObject, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ENV_NAMESPACES } from './config/config.token';
const logger = new Logger('main');
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const config = new DocumentBuilder()
    //.addBearerAuth()
    .setTitle('Assignment API')
    .setVersion('1.0')
    .build();

  const customOptions: SwaggerCustomOptions = {
    customCssUrl: '../../static/css/swaggerStyle.css',
    customfavIcon: '../../static/images/Misc/logo.png',
    customSiteTitle: 'Assignment API',
    swaggerOptions: undefined,
  };

  app.useGlobalGuards();
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api/v1/');

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });

  SwaggerModule.setup('api/v1', app, document, customOptions);

  await app.listen(
    configService.get(`${ENV_NAMESPACES.SERVER}.port`),
    configService.get(`${ENV_NAMESPACES.SERVER}.host`),
  );
  logger.log(`Application is running on: ${await app.getUrl()}`);
  process.on('uncaughtException', function (err) {
    logger.error(err);
  });
}
bootstrap();
