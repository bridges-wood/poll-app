import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { IStoredEntity, POSTS_COLLECTION } from '@org/firebase';
import { Connected, Node } from '@org/graphql/pagination';
import { StaticImplements } from '@org/typings';
import { ResponseConnection } from '../../responses/models/response.model';
import { User } from '../../users/models/user.stub';
import { PostContent } from './contents';
import { PostDbModel, PostModelMapper } from './post.model-mapper';

@ObjectType({ description: 'A post' })
@Directive('@key(selectionSet: "{ id }")')
@Directive('@canonical')
export class Post
  implements
    Node,
    StaticImplements<IStoredEntity<Post, PostDbModel>, typeof Post>
{
  static collectionName = POSTS_COLLECTION;
  static modelMapper = PostModelMapper;

  @Field((type) => ID, {
    description: 'The ID of the post as it is stored in Firebase',
  })
  id: string;

  @Field((type) => PostContent, { description: 'The content of the post' })
  content: typeof PostContent;

  @Field({ description: 'The caption of the post' })
  caption: string;

  @Field((type) => ResponseConnection, {
    description: 'All responses to the post',
  })
  responses: ResponseConnection;

  @Field({ description: 'The date and time the post was created' })
  createdAt: Date;

  @Field({ description: 'The date and time the post was last updated' })
  updatedAt: Date;

  @Field((type) => User, { description: 'The author of the post' })
  author: User;
}

@ObjectType()
export class PostConnection extends Connected(Post) {}
