import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserAuthData } from './models/user-auth-data.model';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query((returns) => UserAuthData)
  async me() {
    return this.authService.me();
  }

  @Mutation((returns) => UserAuthData)
  async login(
    @Args('email') email: string,
    @Args('password') password: string
  ) {
    return this.authService.login(email, password);
  }
}
