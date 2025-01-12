import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../auth/user.schema';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { COMMON_RESPONSE_CODE, COMMON_RESPONSE_MESSAGE } from 'src/utils/common.response';

@Injectable()
export class AuthService {
  logger = new Logger('AuthService');
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  // Register a new user
  async register(traceId: string, email: string, password: string) {
    try {
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        throw new HttpException(
          {
            traceId,
            code: 'USER_ALREADY_EXISTS',
            message: 'User already exists',
            status: HttpStatus.CONFLICT,
          },
          HttpStatus.CONFLICT,
        );
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new this.userModel({ email, password: hashedPassword });
      await newUser.save();

      return newUser;
    } catch (error) {
      this.logger.error({ traceId, error, status: error?.status, response: error?.response }, 'error');
      throw new HttpException(
        {
          code: error?.response?.code ?? COMMON_RESPONSE_CODE.REGISTRATION_FAILED,
          message: error?.response?.message ?? COMMON_RESPONSE_MESSAGE.REGISTRATION_FAILED,
          status:
            error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Login an existing user, return JWT token
  async login(traceId: string, email: string, password: string) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new HttpException(
          {
            traceId,
            code: COMMON_RESPONSE_CODE.INVALID_CREDENTIALS,
            message: COMMON_RESPONSE_MESSAGE.INVALID_CREDENTIALS,
            status: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new HttpException(
          {
            traceId,
            code: COMMON_RESPONSE_CODE.INVALID_CREDENTIALS,
            message: COMMON_RESPONSE_MESSAGE.INVALID_CREDENTIALS,
            status: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const payload = { userId: user._id, email: user.email };
      const token = this.generateJwtToken(traceId, payload);

      return { token };
    } catch (error) {
      this.logger.error({ traceId, error, status: error?.status, response: error?.response }, 'error');
      throw new HttpException(
        {
          traceId,
          code: COMMON_RESPONSE_CODE.LOGIN_FAILED,
          message: COMMON_RESPONSE_MESSAGE.LOGIN_FAILED,
          status:
            error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
        },
        error?.response?.status ?? error?.response?.statusCode ?? error?.status ?? HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Generate JWT Token
  generateJwtToken(traceId: string, payload: any) {
    try {
      const secretKey = process.env.AUTH_SECRET;
      if (!secretKey) {
        throw new HttpException(
          {
            traceId,
            code: COMMON_RESPONSE_CODE.JWT_KEY_MISSING,
            message: COMMON_RESPONSE_MESSAGE.JWT_KEY_MISSING,
            status: HttpStatus.INTERNAL_SERVER_ERROR,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const expiresIn = '1h';
      return jwt.sign(payload, secretKey, { expiresIn });
    } catch (error) {
      this.logger.error({ traceId, error }, 'error');
      throw new HttpException(
        {
          traceId,
          code: COMMON_RESPONSE_CODE.JWT_GENERATION_FAILED,
          message: error.message || COMMON_RESPONSE_MESSAGE.JWT_GENERATION_FAILED,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Validate JWT Token
  async validateJwtToken(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.AUTH_SECRET);
      return decoded;
    } catch (error) {
      this.logger.error({ error }, 'error');
      throw new HttpException(
        {
          code: COMMON_RESPONSE_CODE.AUTH_VALIDATION_FAILED,
          message: COMMON_RESPONSE_MESSAGE.AUTH_VALIDATION_FAILED,
          status: HttpStatus.UNAUTHORIZED,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
