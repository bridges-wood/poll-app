import {
  FetchProfileDataDocument,
  FetchProfileDataQuery,
  FetchProfileDataQueryVariables,
} from '@org/graphql';
import Profile from '@poll-app/components/profile/profile';
import getClient from '@poll-app/lib/api/registered-client';

type UserPageParams = Promise<{
  id: string;
}>;

export default async function User(props: { params: UserPageParams }) {
  const id = (await props.params).id;
  const { data } = await getClient().query<
    FetchProfileDataQuery,
    FetchProfileDataQueryVariables
  >(FetchProfileDataDocument, {
    id: atob(decodeURIComponent(id)),
  });

  if (!data) throw new Error('User not found');

  return data && <Profile user={data?.user} />;
}
