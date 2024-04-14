import {
  FetchProfileDataDocument,
  FetchProfileDataQuery,
  FetchProfileDataQueryVariables,
} from '@org/graphql';
import { registeredClient } from '@poll-app/lib/api';
import { FC } from 'react';
import ProfileEditForm from './ProfileEditForm';

const ProfileEditFormContainer: FC = async () => {
  const { data } = await registeredClient.query<
    FetchProfileDataQuery,
    FetchProfileDataQueryVariables
  >({
    query: FetchProfileDataDocument,
  });

  return <ProfileEditForm data={data} userId={''} />;
};

export default ProfileEditFormContainer;
