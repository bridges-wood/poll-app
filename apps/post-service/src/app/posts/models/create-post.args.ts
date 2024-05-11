import { Field, InputType, PickType } from '@nestjs/graphql';
import { PostContentInput } from './contents';
import { Post } from './post.model';

@InputType()
export class CreatePostArgs extends PickType(
  Post,
  ['caption'] as const,
  InputType,
) {
  @Field((type) => PostContentInput, { description: 'The content of the post' })
  content: PostContentInput;
}
