import {
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';

import { AppService } from './app.service';

@Controller('/apps')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/:app')
  getApp(
    @Req() req: Request,
    @Headers() headers: Headers,
    @Param('app') appName: string
  ) {
    return this.appService.getApp(appName);
  }

  @Get()
  getApps(@Req() req: Request, @Headers() headers: Headers) {
    console.log(req);
    return headers;
  }

  @Post('/:app')
  registerApp(
    @Req() req: Request,
    @Headers() headers: Headers,
    @Param('app') app: string
  ) {
    console.log('registerApp');
    return headers;
  }

  @Put('/:app')
  sendHeartbeat(
    @Req() req: Request,
    @Headers() headers: Headers,
    @Param('app') app: string
  ) {
    console.log('sendHeartbeat');
    return headers;
  }

  @Put('/:app/status')
  setStatus(
    @Req() req: Request,
    @Headers() headers: Headers,
    @Param('app') app: string
  ) {
    console.log('setStatus');
    return headers;
  }

  @Delete('/:app')
  cancelApp(
    @Req() req: Request,
    @Headers() headers: Headers,
    @Param('app') app: string
  ) {
    console.log('cancelApp');
    return headers;
  }
}
