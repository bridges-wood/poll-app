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
import { Separator } from '@org/ui-kit/ui/separator';
import { indexToLetter } from '@poll-app/utils/index-to-letter';
import { Pencil2Icon, PlusIcon, TrashIcon } from '@radix-ui/react-icons';
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
      question: z.string().min(1, 'Question is required'),
      options: z.string().array().min(1, 'At least one option is required'),
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
        className="h-full w-full max-w-screen-xl"
      >
        <h1 className="text-5xl">New Post</h1>
        <Separator className="mb-4 mt-2" />
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
        <Button
          type="submit"
          variant="outline"
          className="absolute bottom-16 right-4 flex items-center gap-2"
        >
          <Pencil2Icon />
          Create Post
        </Button>
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
      console.log(form.getFieldState('content.options'));

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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content.options"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Options</FormLabel>
                <div
                  id="options-list"
                  className="mb-2 flex max-w-md flex-col gap-2 rounded-sm py-2 pl-3 shadow-sm"
                >
                  <AnimatePresence>
                    {field.value.length > 0 ? (
                      field.value.map((_, index) => (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          key={index}
                          className="flex flex-row content-between items-center gap-4"
                        >
                          <span className="w-[2ex] text-center font-bold">
                            {indexToLetter(index)}
                          </span>
                          <FormField
                            control={form.control}
                            name={`content.options.${index}`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
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
                              form.setValue(
                                'content.options',
                                options.filter((_, i) => i !== index),
                              );
                            }}
                          >
                            <TrashIcon />
                          </Button>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-foreground-disabled">No options</div>
                    )}
                  </AnimatePresence>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="flex flex-grow items-center gap-[0.8ex]"
                  onClick={() =>
                    form.setValue('content.options', [...options, ''])
                  }
                >
                  <PlusIcon />
                  <span>Add Option</span>
                </Button>
                <FormMessage />
                {form.getFieldState('content.options').error?.root?.message}
                {/* TODO fix error message */}
              </FormItem>
            )}
          />
        </>
      );
    default:
      return null;
  }
};

export default NewPostPage;
