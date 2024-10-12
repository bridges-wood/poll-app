import {
  FetchProfileDataDocument,
  FetchProfileDataQuery,
  FetchProfileDataQueryVariables,
} from '@org/graphql';
import getClient from '@poll-app/lib/api/registered-client';
import { FC } from 'react';
import AccountUpdateForm from './account-update-form';
import { getLoggedInUserId } from '@poll-app/utils/get-logged-in-user-id';

const AccountUpdateFormContainer: FC = async () => {
  const userId = getLoggedInUserId();
  const { data } = await getClient().query<
    FetchProfileDataQuery,
    FetchProfileDataQueryVariables
  >(FetchProfileDataDocument, {});

  if (data) return <AccountUpdateForm data={data} userId={userId} />;
};

export default AccountUpdateFormContainer;
