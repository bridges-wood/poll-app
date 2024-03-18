import { Query, Resolver } from '@nestjs/graphql';
import { User } from '@org/graphql/nest';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Query((returns) => User)
  async me(): Promise<User> {
    return this.authService.me();
  }

  // @Mutation((returns) => UserAuthData)
  // async login(
  //   @Args('email') email: string,
  //   @Args('password') password: string
  // ) {
  //   return this.authService.login(email, password);
  // }
}
