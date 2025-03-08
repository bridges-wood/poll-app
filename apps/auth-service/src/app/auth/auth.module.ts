import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CryptoModule, JwtConfigService } from '@org/crypto';
import { LogModule } from '@org/log';
import { UserModule } from '../users/user.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [CryptoModule],
      useClass: JwtConfigService,
    }),
    LogModule,
  ],
  providers: [AuthService, AuthResolver],
})
export class AuthModule {}
