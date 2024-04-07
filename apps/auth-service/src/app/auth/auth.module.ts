import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { FirebaseModule } from '@org/firebase';
import { CrossAppModule } from '../cross-app/cross-app.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Module({
  imports: [
    FirebaseModule,
    CrossAppModule,
    JwtModule.register({
      global: true,
      secret: process.env['JWT_SECRET'],
      signOptions: {
        expiresIn: '15m',
      },
    }),
  ],
  providers: [AuthService, AuthResolver],
})
export class AuthModule {}
