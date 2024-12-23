import { Module } from '@nestjs/common';
import { UserModelMapper } from './models/user.model-mapper';

@Module({
  providers: [UserModelMapper],
  exports: [UserModelMapper],
})
export class UserModule {}
