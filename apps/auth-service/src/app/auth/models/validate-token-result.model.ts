import { ObjectType, PickType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class ValidateTokenResult extends PickType(User, ['id', 'roles']) {}
