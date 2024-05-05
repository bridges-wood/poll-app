import {
  FetchProfileDataDocument,
  FetchProfileDataQuery,
  FetchProfileDataQueryVariables,
} from '@org/graphql';
import { useQuery } from '@urql/next';
import { useMemo } from 'react';

const useUser = (token: string | null | undefined) =>
  useQuery<FetchProfileDataQuery, FetchProfileDataQueryVariables>({
    query: FetchProfileDataDocument,
    context: useMemo(
      () => ({ fetchOptions: { cache: 'no-cache' }, token: token ?? null }),
      [token],
    ),
  });

export default useUser;
