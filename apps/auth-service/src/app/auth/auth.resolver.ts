import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignInResult } from './models/sign-in-result.model';
import { SupportedOAuthProvider } from './supported-oauth-providers';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation((returns) => String)
  async signInWithEmailAndPassword(
    @Args('email') email: string,
    @Args('password') password: string,
  ): Promise<string> {
    return this.authService.signInWithEmailAndPassword(email, password);
  }

  @Mutation((returns) => SignInResult)
  async signInWithOAuthToken(
    @Args('token') oauthToken: string,
    @Args('provider') provider: string,
  ): Promise<SignInResult> {
    const token = await this.authService.signInWithOAuthToken(
      oauthToken,
      provider as SupportedOAuthProvider,
    );

    return { token };
  }

  @Query((returns) => String)
  async validateToken(@Args('token') token: string): Promise<string> {
    const decodedIdToken = await this.authService.validateToken(token);

    return decodedIdToken.sub;
  }
}
