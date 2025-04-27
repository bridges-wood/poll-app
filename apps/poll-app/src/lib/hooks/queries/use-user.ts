import {
  CurrentUserProfileDataDocument,
  CurrentUserProfileDataQuery,
  CurrentUserProfileDataQueryVariables,
} from '@org/graphql';
import { useQuery } from '@urql/next';
import { useMemo } from 'react';

const useUser = (token: string | null | undefined) =>
  useQuery<CurrentUserProfileDataQuery, CurrentUserProfileDataQueryVariables>({
    query: CurrentUserProfileDataDocument,
    context: useMemo(
      () => ({ fetchOptions: { cache: 'no-cache' }, token: token ?? null }),
      [token],
    ),
  });

export default useUser;
