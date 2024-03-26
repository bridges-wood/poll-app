import { UseGuards } from '@nestjs/common';
import { Context, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '@org/auth';
import { User } from '@org/graphql/nest';
import { AuthService } from './auth.service';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Query((returns) => User)
  async me(@Context() context): Promise<User> {
    console.log(context);
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
