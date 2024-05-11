import { Field, ID, InputType, ObjectType, PickType } from '@nestjs/graphql';

@ObjectType()
export class Comment {
  @Field((type) => ID)
  id: string;
}

@InputType()
export class CommentInput extends PickType(
  Comment,
  ['id'] as const,
  InputType,
) {}
