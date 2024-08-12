import {
  FetchPostsDocument,
  FetchPostsQuery,
  FetchPostsQueryVariables,
} from '@org/graphql';
import { useQuery } from 'urql';

const usePosts = (last: number = 10, before?: null | undefined | string) =>
  useQuery<FetchPostsQuery, FetchPostsQueryVariables>({
    query: FetchPostsDocument,
    variables: {
      last,
      before,
      orderBy: 'createdAt',
    },
    pause: true,
  });

export default usePosts;
