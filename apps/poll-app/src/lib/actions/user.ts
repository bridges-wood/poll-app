'use server';

import {
  UpdateUserArgs,
  UpdateUserDocument,
  UpdateUserMutation,
  UpdateUserMutationVariables,
  User,
} from '@org/graphql';
import _ from 'lodash';
import getClient from '../api/registeredClient';

export async function updateUserAccount(
  userId: User['id'],
  args: Partial<UpdateUserArgs>,
): Promise<void> {
  const parsedArgs = parseArgs(args);

  await getClient().mutation<UpdateUserMutation, UpdateUserMutationVariables>(
    UpdateUserDocument,
    {
      id: userId,
      args: parsedArgs,
    },
  );
}

const parseArgs = (args: Partial<UpdateUserArgs>): UpdateUserArgs => {
  const fields: (keyof UpdateUserArgs)[] = [
    'displayName',
    'email',
    'firstName',
    'lastName',
  ];

  if (fields.every((field) => !args[field])) {
    throw new Error(`At least one of ${fields.join(', ')} must be provided`);
  }

  return _.chain(fields)
    .map((field) => [field, args[field]])
    .fromPairs()
    .value() as UpdateUserArgs;
};
