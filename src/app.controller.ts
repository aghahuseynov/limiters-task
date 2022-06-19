import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { Private } from './auth/private.decorator';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/private')
  @Private()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/public')
  @Public()
  getPublicHello(): string {
    return this.appService.getHello();
  }
}
