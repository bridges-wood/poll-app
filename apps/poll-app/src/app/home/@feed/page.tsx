import {
  FetchPostsDocument,
  FetchPostsQuery,
  FetchPostsQueryVariables,
} from '@org/graphql';
import getClient from '@poll-app/lib/api/registered-client';
import Feed from './feed';

const PAGE_SIZE = 1;

const FeedWrapper = async () => {
  const { data } = await getClient().query<
    FetchPostsQuery,
    FetchPostsQueryVariables
  >(FetchPostsDocument, {
    last: 1,
    orderBy: 'createdAt',
  });

  // if (!data) throw new Error('Could not load posts');

  return <div>{data && <Feed firstPage={data?.posts} />}</div>;
};

export default FeedWrapper;
