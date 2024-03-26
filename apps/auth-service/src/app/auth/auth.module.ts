import { Module } from '@nestjs/common';
import { AuthModule as AuthGuardsModule } from '@org/auth';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Module({
  providers: [AuthService, AuthResolver],
  imports: [AuthGuardsModule],
})
export class AuthModule {}
