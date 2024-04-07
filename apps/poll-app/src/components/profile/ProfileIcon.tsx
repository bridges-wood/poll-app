import { FetchProfileDataDocument } from '@org/graphql';
import { client } from '@poll-app/lib/api';
import { cookies } from 'next/headers';

const ProfileIcon = async () => {
  // TODO cleanup
  const token = cookies().get('token')?.value;

  const { data } = await client.query({
    query: FetchProfileDataDocument,
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });
  return <div>Hello {data.me.displayName}</div>;
};

export default ProfileIcon;
