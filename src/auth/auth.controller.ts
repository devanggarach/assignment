import { Controller, Post, Body, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/user.dto';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RATE_LIMIT } from 'src/config/config.token';
import { COMMON_RESPONSE_CODE, COMMON_RESPONSE_MESSAGE } from 'src/utils/common.response';
import { RequestId } from 'src/utils';

@Controller('auth')
export class AuthController {
  logger = new Logger('AuthController');
  constructor(private readonly authService: AuthService) {}

  @ApiTags('Register')
  @Post('register')
  @Throttle(RATE_LIMIT.NORMAL.LIMIT, RATE_LIMIT.NORMAL.SECOND)
  async register(@RequestId() traceId: string, @Body() registerDto: RegisterDto) {
    try {
      const { email, password } = registerDto;
      const user = await this.authService.register(traceId, email, password);
      return { traceId, message: COMMON_RESPONSE_MESSAGE.REGISTERED_SUCCESS, data: user };
    } catch (error) {
      this.logger.error({ error, status: error?.status, response: error?.response }, 'error');
      throw new HttpException(
        {
          traceId,
          code: error?.response?.code ?? COMMON_RESPONSE_CODE.INTERNAL_SERVER_ERROR,
          message: error?.response?.message ?? COMMON_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
          status:
            error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error?.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @ApiTags('Login')
  @Post('login')
  @Throttle(RATE_LIMIT.NORMAL.LIMIT, RATE_LIMIT.NORMAL.SECOND)
  async login(@RequestId() traceId: string, @Body() loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;
      const result = await this.authService.login(traceId, email, password);
      return { traceId, message: COMMON_RESPONSE_MESSAGE.LOGIN_SUCCESS, token: result.token };
    } catch (error) {
      this.logger.error({ error, status: error?.status, response: error?.response }, 'error');
      throw new HttpException(
        {
          traceId,
          code: error?.response?.code ?? COMMON_RESPONSE_CODE.INTERNAL_SERVER_ERROR,
          message: error?.response?.message ?? COMMON_RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR,
          status:
            error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error?.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
