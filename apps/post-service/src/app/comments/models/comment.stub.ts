import { Field, ID, InputType, ObjectType, PickType } from '@nestjs/graphql';

@ObjectType({ description: 'Stub comment' })
export class Comment {
  @Field((type) => ID, {
    description: 'The ID of the comment as it is stored in Firebase',
  })
  id: string;
}

@InputType()
export class CommentInput extends PickType(
  Comment,
  ['id'] as const,
  InputType,
) {}
