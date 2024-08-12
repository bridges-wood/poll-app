import { Field, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CommentInput } from '../../comments/models/comment.stub';
import { Post } from './post.model';

@InputType()
export class UpdatePostArgs extends PartialType(
  OmitType(Post, [
    'id',
    'createdAt',
    'updatedAt',
    'content',
    'responses',
    'author',
  ] as const),
  InputType,
) {
  @Field((type) => [CommentInput], { nullable: true })
  comments?: CommentInput[];
}
