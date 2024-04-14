'use client';
import { FetchProfileDataQuery, User } from '@org/graphql';
import { updateUserAccount } from '@poll-app/lib/actions';
import * as Form from '@radix-ui/react-form';
import {
  Button,
  TextFieldInput,
  TextFieldRoot,
  TextFieldSlot,
} from '@radix-ui/themes';
import { FC } from 'react';

export type ProfileEditFormProps = {
  userId: User['id'];
  data: FetchProfileDataQuery;
};

const ProfileEditForm: FC<ProfileEditFormProps> = ({ data, userId }) => {
  const updateUserAccountWithId = updateUserAccount.bind(null, userId);

  return (
    <Form.Root
      className="flex flex-col justify-center items-center"
      action={updateUserAccountWithId}
    >
      <Form.Field name="displayName">
        <Form.Label>Display Name</Form.Label>
        <Form.Control asChild>
          <TextFieldRoot className="w-full">
            <TextFieldSlot>@</TextFieldSlot>
            <TextFieldInput
              name="displayName"
              defaultValue={data.me.displayName}
              autoComplete="username"
            />
          </TextFieldRoot>
        </Form.Control>
      </Form.Field>
      <Form.Field name="email">
        <Form.Label>Email Address</Form.Label>
        <Form.Control asChild>
          <TextFieldRoot className="w-full">
            <TextFieldInput
              name="email"
              defaultValue={data.me.email}
              autoComplete="email"
            />
          </TextFieldRoot>
        </Form.Control>
      </Form.Field>
      <Form.Field name="name">
        <Form.Label>Name</Form.Label>
        <Form.Control asChild>
          <TextFieldRoot className="w-full">
            <TextFieldInput
              name="firstName"
              defaultValue={data.me.firstName || ''}
              autoComplete="given-name"
            />
            <TextFieldInput
              name="lastName"
              defaultValue={data.me.lastName || ''}
              autoComplete="family-name"
            />
          </TextFieldRoot>
        </Form.Control>
      </Form.Field>
      <Button type="submit" className="cursor-pointer">
        Save
      </Button>
    </Form.Root>
  );
};

export default ProfileEditForm;
