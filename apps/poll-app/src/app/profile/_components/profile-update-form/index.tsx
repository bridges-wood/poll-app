import {
  FetchProfileDataDocument,
  FetchProfileDataQuery,
  FetchProfileDataQueryVariables,
} from '@org/graphql';
import getClient from '@poll-app/lib/api/registered-client';
import { getLoggedInUserId } from '@poll-app/utils/get-logged-in-user-id';
import { FC } from 'react';
import ProfileUpdateForm from './profile-update-form';
import { QueryWrapperProps } from '@poll-app/lib/types';

export type ProfileUpdateFormContainerProps = QueryWrapperProps;

const ProfileUpdateFormContainer: FC<ProfileUpdateFormContainerProps> = async ({
  skeleton,
}) => {
  if (skeleton) return <ProfileUpdateForm skeleton />;

  const userId = await getLoggedInUserId();
  const { data } = await getClient().query<
    FetchProfileDataQuery,
    FetchProfileDataQueryVariables
  >(FetchProfileDataDocument, {});

  if (data) return <ProfileUpdateForm data={data} userId={userId} />;
};

export default ProfileUpdateFormContainer;
