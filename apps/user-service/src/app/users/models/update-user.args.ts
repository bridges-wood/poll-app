import { InputType, OmitType, PartialType } from '@nestjs/graphql';
import { User } from './user.model';

@InputType()
export class UpdateUserArgs extends PartialType(
  OmitType(User, ['id', 'createdAt', 'updatedAt'] as const),
  InputType,
) {}
