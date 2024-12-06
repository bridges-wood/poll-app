import {
  FetchProfileDataDocument,
  FetchProfileDataQuery,
  FetchProfileDataQueryVariables,
} from '@org/graphql';
import getClient from '@poll-app/lib/api/registered-client';
import { getLoggedInUserId } from '@poll-app/utils/get-logged-in-user-id';
import { FC } from 'react';
import AccountUpdateForm from './account-update-form';

const AccountUpdateFormContainer: FC = async () => {
  const userId = await getLoggedInUserId();
  const { data } = await getClient().query<
    FetchProfileDataQuery,
    FetchProfileDataQueryVariables
  >(FetchProfileDataDocument, {});

  if (data) return <AccountUpdateForm data={data} userId={userId} />;
};

export default AccountUpdateFormContainer;
