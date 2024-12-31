import { Mutation, Resolver } from '@nestjs/graphql';
import { Public } from '@org/auth';
import { RegistrationService } from './registration.service';

@Resolver()
export class RegistrationResolver {
  constructor(private readonly registrationService: RegistrationService) {}

  @Public()
  @Mutation(
    /* istanbul ignore next */
    (_returns) => Boolean,
    {
      description:
        'Disconnects the service from the gateway and re-initiates the registration process',
    },
  )
  async _reRegister(): Promise<boolean> {
    return this.registrationService.reRegister();
  }
}
