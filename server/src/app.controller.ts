import { AuthService } from './auth/auth.service';
import { Controller, Get, Request } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly authService: AuthService) {}

  @Get()
  getHello(@Request() req) : string { // TODO: require an Bearer token, validate token
    return this.appService.getHello();
  }

}
