import { Controller, Get } from '@nestjs/common';
import { Public } from '@org/auth';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  health(): string {
    return 'OK';
  }
}
