import { IS_PRIVATE_KEY } from './private.decorator';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const isPrivate = this.reflector.getAllAndOverride<boolean>(
      IS_PRIVATE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isPrivate) {
      const request = context.switchToHttp().getRequest();
      return process.env.TOKEN === request.headers.authorization;
    }

    return true;
  }
}
