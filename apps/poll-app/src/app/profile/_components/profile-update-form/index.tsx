import {
  FetchProfileDataDocument,
  FetchProfileDataQuery,
  FetchProfileDataQueryVariables,
} from '@org/graphql';
import getClient from '@poll-app/lib/api/registeredClient';
import { getLoggedInUserId } from '@poll-app/utils/index';
import { FC } from 'react';
import ProfileUpdateForm from './profile-update-form';

const ProfileUpdateFormContainer: FC = async () => {
  const userId = getLoggedInUserId();
  const { data } = await getClient().query<
    FetchProfileDataQuery,
    FetchProfileDataQueryVariables
  >(FetchProfileDataDocument, {});

  if (data) return <ProfileUpdateForm data={data} userId={userId} />;
};

export default ProfileUpdateFormContainer;
