import {
  FetchMyProfileDataDocument,
  FetchMyProfileDataQuery,
  FetchMyProfileDataQueryVariables,
} from '@org/graphql';
import getClient from '@poll-app/lib/api/registered-client';
import { FC } from 'react';
import ProfileIcon, { ProfileIconProps } from './profile-icon';

export type ProfileIconContainerProps = Omit<ProfileIconProps, 'data'>;

const ProfileIconContainer: FC<ProfileIconContainerProps> = async (props) => {
  const { data } = await getClient().query<
    FetchMyProfileDataQuery,
    FetchMyProfileDataQueryVariables
  >(FetchMyProfileDataDocument, {});
  if (!data) return null;

  return <ProfileIcon data={data.me} {...props} />;
};

export default ProfileIconContainer;
