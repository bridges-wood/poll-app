import { Module } from '@nestjs/common';
import { SchemaModule } from '../schema/schema.module';
import { EndpointsResolver } from './endpoints.resolver';
import { EndpointsService } from './endpoints.service';

@Module({
  imports: [SchemaModule],
  providers: [EndpointsResolver, EndpointsService],
})
export class EndpointsModule {}
