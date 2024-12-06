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
import { updateUserAccount } from '@poll-app/lib/actions';
import { FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export type AccountUpdateFormProps = {
  userId: User['id'];
  data: FetchProfileDataQuery;
};

const formSchema = z.object({
  email: z.string().email(),
  givenName: z.string().optional(),
  profilePicture: z.string().optional(),
});

const AccountUpdateForm: FC<AccountUpdateFormProps> = ({ data, userId }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: data.me.email,
      givenName: data.me.firstName || '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await updateUserAccount(userId, data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem className="mb-4 max-w-sm">
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="email" />
              </FormControl>
              <FormDescription>
                Your email address is how we&apos;ll contact you. We&apos;ll
                never share it with anyone.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="givenName"
          control={form.control}
          render={({ field }) => (
            <FormItem className="mb-4 max-w-sm">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="given-name" />
              </FormControl>
              <FormDescription>
                Your name is how we&apos;ll address you. We never share your
                name with other users.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save</Button>
      </form>
    </Form>
  );
};

export default AccountUpdateForm;
