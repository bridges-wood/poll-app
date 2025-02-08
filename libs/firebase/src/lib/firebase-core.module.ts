import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { BaseLogger, LogModule } from '@org/log';
import { auth, database } from './client';
import { FirebaseTokens } from './tokens';

@Global()
@Module({
  imports: [LogModule],
})
export class FirebaseCoreModule {
  constructor(private readonly logger: BaseLogger) {
    this.logger.setContext(FirebaseCoreModule.name);
  }

  static forRoot(): DynamicModule {
    const providers: Provider[] = [
      this.createAuthProvider(),
      this.createDatabaseProvider(),
    ];

    return {
      module: FirebaseCoreModule,
      providers,
      exports: providers,
    };
  }

  static createDatabaseProvider(): Provider {
    return {
      provide: FirebaseTokens.DATABASE,
      useValue: database,
    };
  }

  static createAuthProvider(): Provider {
    return {
      provide: FirebaseTokens.AUTH,
      useValue: auth,
    };
  }
}
