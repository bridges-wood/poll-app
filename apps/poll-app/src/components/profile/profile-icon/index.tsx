import {
  FetchProfileDataDocument,
  FetchProfileDataQuery,
  FetchProfileDataQueryVariables,
} from '@org/graphql';
import { registeredClient } from '@poll-app/lib/api';
import { FC } from 'react';
import ProfileIcon, { ProfileIconProps } from './ProfileIcon';

export type ProfileIconContainerProps = Omit<ProfileIconProps, 'data'>;

const ProfileIconContainer: FC<ProfileIconContainerProps> = async (props) => {
  const { data } = await registeredClient.query<
    FetchProfileDataQuery,
    FetchProfileDataQueryVariables
  >({
    query: FetchProfileDataDocument,
  });

  return <ProfileIcon data={data} {...props} />;
};

export default ProfileIconContainer;
