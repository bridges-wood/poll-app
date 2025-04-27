import {
  FetchMyProfileDataDocument,
  FetchMyProfileDataQuery,
  FetchMyProfileDataQueryVariables,
} from '@org/graphql';
import getClient from '@poll-app/lib/api/registered-client';
import { QueryWrapperProps } from '@poll-app/lib/types';
import { getLoggedInUserId } from '@poll-app/utils/get-logged-in-user-id';
import { FC } from 'react';
import ProfileUpdateForm from './profile-update-form';

export type ProfileUpdateFormContainerProps = QueryWrapperProps;

const ProfileUpdateFormContainer: FC<ProfileUpdateFormContainerProps> = async ({
  skeleton,
}) => {
  if (skeleton) return <ProfileUpdateForm skeleton />;

  const userId = await getLoggedInUserId();
  const { data } = await getClient().query<
    FetchMyProfileDataQuery,
    FetchMyProfileDataQueryVariables
  >(FetchMyProfileDataDocument, {});

  if (data) return <ProfileUpdateForm data={data} userId={userId} />;
};

export default ProfileUpdateFormContainer;
