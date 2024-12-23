import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FirebaseModule } from '@org/firebase';
import { CryptoModule } from '../crypto/crypto.module';
import { JwtConfigService } from '../crypto/jwt.config.service';
import { UserModule } from '../users/user.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Module({
  imports: [
    FirebaseModule,
    UserModule,
    JwtModule.registerAsync({
      imports: [CryptoModule],
      useClass: JwtConfigService,
    }),
  ],
  providers: [AuthService, AuthResolver],
})
export class AuthModule {}
