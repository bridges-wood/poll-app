'use server';

import {
  UpdateUserArgs,
  UpdateUserDocument,
  UpdateUserMutation,
  UpdateUserMutationVariables,
  User,
} from '@org/graphql';
import _ from 'lodash';
import { registeredClient } from '../api';

export async function updateUserAccount(
  userId: User['id'],
  formData: FormData,
): Promise<void> {
  const args = parseFormData(formData);

  await registeredClient.mutate<
    UpdateUserMutation,
    UpdateUserMutationVariables
  >({
    mutation: UpdateUserDocument,
    variables: {
      id: userId,
      args,
    },
  });
}

const parseFormData = (formData: FormData): UpdateUserArgs => {
  const fields: (keyof UpdateUserArgs)[] = [
    'displayName',
    'email',
    'firstName',
    'lastName',
  ];

  if (fields.every((field) => !formData.has(field))) {
    throw new Error(`At least one of ${fields.join(', ')} must be provided`);
  }

  return _.chain(fields)
    .map((field) => [field, formData.get(field)])
    .fromPairs()
    .value() as UpdateUserArgs;
};
