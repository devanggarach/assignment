import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerUserGuard extends ThrottlerGuard {
  protected errorMessage = 'This is overload limit';

  getTracker(req: Request): string {
    if (req['user'] != undefined) {
      return req['user']['email'];
    } else {
      return req['ips'].length ? req['ips'][0] : req['ip'];
    }
  }

  generateKey(context: ExecutionContext, suffix: string): string {
    const request = context.switchToHttp().getRequest();
    const endpoint = request.route?.path || '';
    return `${suffix}:${endpoint}`;
  }
}
