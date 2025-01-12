import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { COMMON_RESPONSE_CODE, COMMON_RESPONSE_MESSAGE } from 'src/utils/common.response';

@Injectable()
export class JwtStrategy implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException(COMMON_RESPONSE_MESSAGE.AUTH_TOKEN_REQUIRED);
    }

    const user = await this.authService.validateJwtToken(token);
    if (!user) {
      throw new UnauthorizedException(COMMON_RESPONSE_CODE.INVALID_TOKEN);
    }

    request.user = user;
    return true;
  }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }
}
