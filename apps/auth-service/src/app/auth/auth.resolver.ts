import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { extractAuthTokenFromHeader } from '@org/auth';
import { FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { AuthResult } from './models/sign-in-result.model';
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

  @Mutation((returns) => AuthResult)
  async signInWithOAuthToken(
    @Args('token') oauthToken: string,
    @Args('provider') provider: string,
  ): Promise<AuthResult> {
    const token = await this.authService.signInWithOAuthToken(
      oauthToken,
      provider as SupportedOAuthProvider,
    );

    return { token };
  }

  @Mutation((returns) => AuthResult)
  async refreshToken(
    @Context('req') request: FastifyRequest,
  ): Promise<AuthResult> {
    const token = extractAuthTokenFromHeader(request);

    const refreshedToken = await this.authService.refreshToken(token);
    return { token: refreshedToken };
  }

  @Query((returns) => String)
  async validateToken(@Args('token') token: string): Promise<string> {
    const decodedIdToken = await this.authService.validateToken(token);

    return decodedIdToken.sub;
  }
}
