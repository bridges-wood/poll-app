import { Module } from '@nestjs/common';
import { AuthGuardModule } from '@org/auth';
import { FirebaseModule } from '@org/firebase';
import { PubSubModule } from '@org/pubsub';
import { ResponseModelMapper } from './models/response.model-mapper';
import { ResponsesResolver } from './responses.resolver';
import { ResponsesService } from './responses.service';

@Module({
  imports: [FirebaseModule, PubSubModule, AuthGuardModule],
  providers: [ResponseModelMapper, ResponsesService, ResponsesResolver],
  exports: [ResponseModelMapper, ResponsesService],
})
export class ResponsesModule {}
