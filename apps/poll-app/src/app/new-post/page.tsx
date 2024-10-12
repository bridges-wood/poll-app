'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { PostContentType } from '@org/graphql';
import { Button } from '@org/ui-kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@org/ui-kit/ui/form';
import { Input } from '@org/ui-kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@org/ui-kit/ui/select';
import { indexToLetter } from '@poll-app/utils/index-to-letter';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { AnimatePresence, motion } from 'framer-motion';
import { toPairs } from 'lodash';
import { FC } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

const postSchema = z.object({
  content: z.discriminatedUnion('type', [
    // Multiple Choice
    z.object({
      type: z.literal(PostContentType.MultipleChoice),
      question: z.string().min(1),
      options: z.string().array().nonempty(),
    }),
  ]),
});

const NewPostPage = () => {
  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: {
        type: PostContentType.MultipleChoice,
        question: '',
        options: [],
      },
    },
    mode: 'onBlur',
  });
  const contentType = form.watch('content.type');

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => console.log(data))}
        className="h-full"
      >
        <FormField
          name="content.type"
          control={form.control}
          render={({ field }) => (
            <FormItem className="mb-4 max-w-md">
              <FormLabel>Content</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background-inset shadow-floating-sm">
                  {toPairs(PostContentType).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {key.split(/(?=[A-Z])/).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <NewPostContent contentType={contentType} form={form} />
      </form>
    </Form>
  );
};

const NewPostContent: FC<{
  contentType: PostContentType;
  form: UseFormReturn<z.infer<typeof postSchema>>;
}> = ({ contentType, form }) => {
  switch (contentType) {
    case PostContentType.MultipleChoice:
      const options = form.watch('content.options');

      return (
        <>
          <FormField
            control={form.control}
            name="content.question"
            render={({ field }) => (
              <FormItem className="mb-4 max-w-md">
                <FormLabel>Question</FormLabel>
                <FormControl>
                  <Input {...field} id="Question" />
                </FormControl>
              </FormItem>
            )}
          />
          <AnimatePresence>
            {options.length > 0 ? (
              options.map((option, index) => (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={index}
                  className="flex flex-row content-between items-baseline gap-4"
                >
                  <span className="w-[2ex] text-center font-bold">
                    {indexToLetter(index)}
                  </span>
                  <FormField
                    control={form.control}
                    name={`content.options.${index}`}
                    render={({ field }) => (
                      <FormItem className="mb-4 max-w-md">
                        <FormControl>
                          <Input {...field} id={`Option-${index}`} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    variant="danger"
                    size="icon"
                    onClick={(e) => {
                      e.preventDefault();
                      form.setValue('content.options', [
                        ...options.slice(0, index),
                        ...options.slice(index + 1),
                      ] as [string, ...string[]]);
                    }}
                  >
                    <TrashIcon />
                  </Button>
                </motion.div>
              ))
            ) : (
              <div>No options</div>
            )}
          </AnimatePresence> 
          <Button
            type="button"
            variant="outline"
            className="flex flex-grow items-center gap-[0.8ex]"
            onClick={() => form.setValue('content.options', [...options, ''])}
          >
            <PlusIcon />
            <span>Add Option</span>
          </Button>
        </>
      );
    default:
      return null;
  }
};

export default NewPostPage;
