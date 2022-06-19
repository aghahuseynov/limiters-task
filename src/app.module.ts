import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { IpLimiterGuard } from './limiters/ip.limiter.guard';
import { TokenLimiterGuard } from './limiters/token.limiter.guard';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: IpLimiterGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TokenLimiterGuard,
    },
  ],
})
export class AppModule {}
