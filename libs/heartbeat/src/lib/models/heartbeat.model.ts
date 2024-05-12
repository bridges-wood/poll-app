import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum ServiceStatus {
  STARTING_UP = 'STARTING_UP',
  OK = 'OK',
  ERROR = 'ERROR',
  SHUTTING_DOWN = 'SHUTTING_DOWN',
}

registerEnumType(ServiceStatus, {
  name: 'ServiceStatus',
  description: 'The status of the service',
});

@ObjectType({ description: 'Heartbeat message' })
export class Heartbeat {
  @Field((type) => ServiceStatus, {
    description: 'The status of the service',
  })
  status!: ServiceStatus;

  @Field({ description: 'Timezone the service is running in' })
  timezone!: string;

  @Field({ description: 'The current time on the service' })
  time!: Date;
}
