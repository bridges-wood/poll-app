import { DynamicModule, Module } from '@nestjs/common';
import { Node } from '@org/graphql/pagination';
import { LogModule } from '@org/log';
import { PubSubModule } from '@org/pubsub';
import { FirebaseCoreModule } from './firebase-core.module';
import { createFirebaseProviders } from './firebase.providers';
import { FirebaseModuleOptions } from './interfaces';

@Module({})
export class FirebaseModule {
  static forRoot(): DynamicModule {
    return {
      module: FirebaseModule,
      imports: [FirebaseCoreModule.forRoot()],
    };
  }

  static forFeature<T extends Node>({
    entities,
    imports,
    providers,
  }: FirebaseModuleOptions<T>): DynamicModule {
    const firebaseProviders = createFirebaseProviders(entities);
    return {
      imports: [LogModule, PubSubModule, ...(imports || [])],
      module: FirebaseModule,
      providers: [...firebaseProviders, ...(providers || [])],
      exports: firebaseProviders,
    };
  }
}
