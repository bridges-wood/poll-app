import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { AppController } from './apps.controller';
import { RegistryModule } from './registry/registry.module';

@Module({
  imports: [RegistryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
