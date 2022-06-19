import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../auth/public.decorator';

export let requestArr = [];

@Injectable()
export class IpLimiterGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const clientIP =
      request.headers['x-forwarded-for'] || request.connection.remoteAddress;

    const date = new Date();
    date.setHours(date.getHours() - 1);

    const filtered = requestArr.filter(
      (q) => q.ip === clientIP && q.date > date,
    );

    if (filtered.length > Number(process.env.IP_LIMIT_PER_HOUR)) {
      throw new HttpException('Too many requests', 429);
    }

    requestArr.push({ ip: clientIP, date: new Date() });

    return true;
  }
}
