'use client';

import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { usePrevious } from '@mantine/hooks';
import { useState, type FC } from 'react';
import axios, { AxiosError } from 'axios';

import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useCustomToast } from '@/hooks/use-custom-toast';
import type { CommentVote, VoteType } from '@prisma/client';
import type { CommentVoteRequest } from '@/lib/validators/vote';

type PartialVote = Pick<CommentVote, 'type'>;

interface CommentVotesProps {
  commentId: string;
  initialVotesAmount: number;
  initialVote?: PartialVote;
}

export const CommentVotes: FC<CommentVotesProps> = ({
  commentId,
  initialVotesAmount,
  initialVote,
}) => {
  const { loginToast } = useCustomToast();
  const [votesAmount, setVotesAmount] = useState<number>(initialVotesAmount);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const previousVote = usePrevious(currentVote);
  const { mutate: castVote } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload: CommentVoteRequest = {
        commentId,
        voteType: type,
      };

      await axios.patch('/api/subreddit/post/comment/vote', payload);
    },
    onError: (error, voteType) => {
      // revert vote
      if (voteType === 'UP') {
        setVotesAmount((prev) => prev - 1);
      } else {
        setVotesAmount((prev) => prev + 1);
      }

      // reset current vote
      setCurrentVote(previousVote);

      // login toast for 401
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: 'Something went wrong.',
        description: 'Your vote was not registered. Please try again.',
        variant: 'destructive',
      });
    },
    onMutate: (type) => {
      // Optimistic Update
      if (currentVote?.type === type) {
        setCurrentVote(undefined);
        if (type === 'UP') {
          setVotesAmount((prev) => prev - 1);
        } else {
          setVotesAmount((prev) => prev + 1);
        }
      } else {
        setCurrentVote({ type });
        if (type === 'UP') {
          setVotesAmount((prev) => prev + (currentVote ? 2 : 1));
        } else {
          setVotesAmount((prev) => prev - (currentVote ? 2 : 1));
        }
      }
    },
  });

  return (
    <div className="flex gap-1">
      {/* Upvote */}
      <Button
        onClick={() => castVote('UP')}
        size="sm"
        variant={'ghost'}
        aria-label="upvote"
      >
        <ArrowBigUp
          className={cn(
            'h-5 w-5 text-zinc-700',
            currentVote?.type === 'UP' && 'text-emerald-500 fill-emerald-500'
          )}
        />
      </Button>

      {/* Score */}
      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmount}
      </p>

      {/* Downvote */}
      <Button
        onClick={() => castVote('DOWN')}
        size="sm"
        variant={'ghost'}
        aria-label="downvote"
      >
        <ArrowBigDown
          className={cn(
            'h-5 w-5 text-zinc-700',
            currentVote?.type === 'DOWN' && 'text-red-500 fill-red-500'
          )}
        />
      </Button>
    </div>
  );
};
