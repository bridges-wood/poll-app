import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Comment } from '../../comments/models/comment.stub';
import { User } from '../../users/models/user.stub';
import { PostContent } from './contents';

@ObjectType({ description: 'A post' })
@Directive('@key(selectionSet: "{ id }")')
@Directive('@canonical')
export class Post {
  @Field((type) => ID, {
    description: 'The ID of the post as it is stored in Firebase',
  })
  id: string;

  @Field((type) => PostContent, { description: 'The content of the post' })
  content: typeof PostContent;

  @Field({ description: 'The caption of the post' })
  caption: string;

  @Field((type) => [Comment], { description: 'All comments on the post' })
  comments: Comment[];

  @Field({ description: 'The date and time the post was created' })
  createdAt: Date;

  @Field({ description: 'The date and time the post was last updated' })
  updatedAt: Date;

  @Field((type) => User, { description: 'The author of the post' })
  author: User;
}
