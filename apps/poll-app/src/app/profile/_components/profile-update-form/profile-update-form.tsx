'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { FetchProfileDataQuery, User } from '@org/graphql';
import { Button } from '@org/ui-kit/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@org/ui-kit/ui/form';
import { Input } from '@org/ui-kit/ui/input';
import { Textarea } from '@org/ui-kit/ui/textarea';
import { updateUserAccount } from '@poll-app/lib/actions';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export type ProfileUpdateFormProps = {
  userId: User['id'];
  data: FetchProfileDataQuery;
};

const formSchema = z.object({
  displayName: z
    .string()
    .min(3, {
      message: 'Display name must be at least 3 characters long',
    })
    .max(30, {
      message: 'Display name cannot exceed 30 characters',
    }),
  bio: z
    .string()
    .max(256, {
      message: 'Bio cannot exceed 256 characters',
    })
    .optional(),
  profilePicture: z.string().optional(),
});

const ProfileUpdateForm: FC<ProfileUpdateFormProps> = ({ data, userId }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      displayName: data.me.displayName,
    },
    mode: 'onTouched',
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await updateUserAccount(userId, data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="displayName"
          control={form.control}
          render={({ field }) => (
            <FormItem className="mb-4 max-w-sm">
              <FormLabel>Display Name</FormLabel>
              <FormControl>
                <Input
                  startContent={
                    <span className="select-none opacity-50">@</span>
                  }
                  {...field}
                  isClearable
                  onClear={() => form.setValue('displayName', '')}
                  autoComplete="username"
                />
              </FormControl>
              <FormDescription>
                Your display name is how other users will see you.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="bio"
          control={form.control}
          render={({ field }) => (
            <FormItem className="mb-4 max-w-sm">
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a bit about yourself"
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex justify-between">
                You can @mention other users and organizations.
                <span
                  className={`font-bold ${
                    (field.value?.length || 0) > 256 ? 'text-destructive' : ''
                  }`}
                >
                  ({field.value?.length || 0}/256)
                </span>
              </FormDescription>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={!form.formState.isValid}>
          Save
        </Button>
      </form>
    </Form>
  );
};

export default ProfileUpdateForm;
