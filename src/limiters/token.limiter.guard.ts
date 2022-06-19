import { IS_PRIVATE_KEY } from './../auth/private.decorator';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

export const requestArr = [];

@Injectable()
export class TokenLimiterGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPrivate = this.reflector.getAllAndOverride<boolean>(
      IS_PRIVATE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isPrivate) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const clientToken = request.headers.authorization;

    if (clientToken !== process.env.TOKEN) {
      return false;
    }

    const date = new Date();
    date.setHours(date.getHours() - 1);

    const filtered = requestArr.filter(
      (q) => q.token === clientToken && q.date > date,
    );

    if (filtered.length > Number(process.env.TOKEN_LIMIT_PER_HOUR)) {
      return false;
    }

    requestArr.push({ token: clientToken, date: new Date() });

    return true;
  }
}
