import { InputType, PickType } from '@nestjs/graphql';
import { User } from './user.model';

@InputType()
export class CreateUserArgs extends PickType(
  User,
  ['displayName', 'email', 'profilePicture'] as const,
  InputType,
) {}
