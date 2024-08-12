import {
  FetchPostDocument,
  FetchPostQuery,
  FetchPostQueryVariables,
} from '@org/graphql';
import { default as PostComponent } from '@poll-app/components/post/post';
import getClient from '@poll-app/lib/api/registered-client';
import { FC } from 'react';

interface PostPageParams {
  params: {
    slug: string;
  };
}

const Post: FC<PostPageParams> = async ({ params: { slug } }) => {
  const { data } = await getClient().query<
    FetchPostQuery,
    FetchPostQueryVariables
  >(FetchPostDocument, {
    id: atob(decodeURIComponent(slug)),
  });

  if (!data) throw new Error('Post not found');

  return data && <PostComponent post={data?.post} />;
};

export default Post;
