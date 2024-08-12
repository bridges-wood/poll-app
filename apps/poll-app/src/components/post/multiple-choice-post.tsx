import {
  FeedMultipleChoiceQuestionFragment,
  FeedPostFragment,
} from '@org/graphql';
import { Button } from '@org/ui-kit/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { sum } from 'lodash';
import { FC, useState } from 'react';

export type FeedMultipleChoicePost = FeedPostFragment & {
  content: FeedMultipleChoiceQuestionFragment;
};

interface MultipleChoicePostProps {
  post: FeedMultipleChoicePost;
}

const MultipleChoicePostBody: FC<MultipleChoicePostProps> = ({ post }) => {
  const totalVotes = sum(post.content.voteTotals);
  const [selectedOption, setSelectedOption] = useState<number | undefined>(
    undefined,
  );
  const userHasVoted = selectedOption !== undefined;

  const vote = (option: number) => {
    if (selectedOption === undefined) {
      setSelectedOption(option);
      // Optimistically update the vote count
      post.content.voteTotals[option]++;
    }
  };

  // TODO fix color of the bar
  return (
    <form className="flex flex-col" onSubmit={(e) => e.preventDefault()}>
      {post.content.options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          className="relative mb-1 block w-full p-0 last:mb-0 disabled:text-black"
          onClick={() => vote(index)}
          disabled={userHasVoted}
        >
          <AnimatePresence>
            {userHasVoted && (
              <motion.div
                initial={{ right: '100%' }}
                animate={{
                  right: `${
                    (1 - post.content.voteTotals[index] / totalVotes) * 100
                  }%`,
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                data-voted={selectedOption === index}
                className={`data-[voted=true]:bg-background-accent-muted absolute left-0 top-0 h-full rounded-md data-[voted=false]:bg-gray-300`}
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

const indexToLetter = (index: number): string => {
  if (index <= 25) {
    return String.fromCharCode(65 + index);
  }

  return (
    String.fromCharCode(65 + (index % 26)) +
    indexToLetter(Math.floor(index / 26))
  );
};

export default MultipleChoicePostBody;
