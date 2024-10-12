import {
  FeedMultipleChoiceQuestionFragment,
  FeedPostFragment,
  PostContentType,
  VoteOnMultipleChoicePostDocument,
  VoteOnMultipleChoicePostMutation,
  VoteOnMultipleChoicePostMutationVariables,
} from '@org/graphql';
import { Button } from '@org/ui-kit/ui/button';
import { indexToLetter } from '@poll-app/utils/index-to-letter';
import assert from 'assert';
import { AnimatePresence, motion } from 'framer-motion';
import { sum } from 'lodash';
import { FC, useEffect, useState } from 'react';
import { useMutation } from 'urql';

export type FeedMultipleChoicePost = FeedPostFragment & {
  content: FeedMultipleChoiceQuestionFragment;
};

interface MultipleChoicePostProps {
  post: FeedMultipleChoicePost;
}

const MultipleChoicePostBody: FC<MultipleChoicePostProps> = ({ post }) => {
  const totalVotes = sum(post.content.voteTotals);
  const [selectedOption, setSelectedOption] = useState<number | undefined>(
    post.myResponses.edges?.at(0)?.node.selectedOption,
  );
  const userHasVoted = selectedOption !== undefined;
  const [voteResult, voteOnPost] = useMutation<
    VoteOnMultipleChoicePostMutation,
    VoteOnMultipleChoicePostMutationVariables
  >(VoteOnMultipleChoicePostDocument);

  const vote = (option: number) => {
    if (selectedOption === undefined) {
      voteOnPost({
        postId: post.id,
        response: {
          selectedOption: option,
          type: PostContentType.MultipleChoice,
        },
      });

      setSelectedOption(option);
      // Optimistically update the vote count
      post.content.voteTotals[option]++;
    }
  };

  useEffect(() => {
    if (voteResult.data) {
      setSelectedOption(voteResult.data.createResponse.selectedOption);
    } else if (voteResult.error) {
      assert(selectedOption !== undefined, 'selectedOption should be defined');
      // Unwind the optimistic update
      post.content.voteTotals[selectedOption]--;
      setSelectedOption(undefined);
      // TODO: Show error message
    }
  }, [voteResult]);

  const voteFraction = (option: number) =>
    (1 - post.content.voteTotals[option] / totalVotes) * 100;

  return (
    <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
      {post.content.options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          className="data-[voted=true]:text-foreground-done data-[voted=false]:text-foreground-neutral relative mb-1 block w-full p-0 last:mb-0"
          onClick={() => vote(index)}
          disabled={userHasVoted}
          data-voted={selectedOption === index}
        >
          <AnimatePresence>
            {userHasVoted && (
              <motion.div
                initial={{
                  right: userHasVoted ? `${voteFraction(index)}%` : '100%',
                }}
                animate={{
                  right: `${voteFraction(index)}%`,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                data-voted={selectedOption === index}
                className={`data-[voted=true]:bg-background-done-muted data-[voted=false]:bg-background-neutral-muted absolute left-0 top-0 h-full rounded-md`}
              />
            )}
          </AnimatePresence>
          <div className="absolute left-4 right-4 top-2 z-10 flex flex-row justify-start gap-[1ex]">
            <span>{indexToLetter(index)}</span>
            <span>{option}</span>
            {userHasVoted && (
              <>
                <span className="ml-auto">
                  {post.content.voteTotals[index]} vote
                  {post.content.voteTotals[index] === 1 ? '' : 's'}
                </span>
                <span>
                  {(
                    (post.content.voteTotals[index] / totalVotes) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </>
            )}
          </div>
        </Button>
      ))}
    </form>
  );
};

export default MultipleChoicePostBody;
