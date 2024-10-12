import {
  FetchProfileDataDocument,
  FetchProfileDataQuery,
  FetchProfileDataQueryVariables,
} from '@org/graphql';
import getClient from '@poll-app/lib/api/registered-client';
import { FC } from 'react';
import ProfileUpdateForm from './profile-update-form';
import { getLoggedInUserId } from '@poll-app/utils/get-logged-in-user-id';

export interface ProfileUpdateFormContainerProps extends QueryWrapperProps {}

const ProfileUpdateFormContainer: FC<ProfileUpdateFormContainerProps> = async ({
  skeleton,
}) => {
  if (skeleton) return <ProfileUpdateForm skeleton />;

  const userId = getLoggedInUserId();
  const { data } = await getClient().query<
    FetchProfileDataQuery,
    FetchProfileDataQueryVariables
  >(FetchProfileDataDocument, {});

  if (data) return <ProfileUpdateForm data={data} userId={userId} />;
};

export default ProfileUpdateFormContainer;
