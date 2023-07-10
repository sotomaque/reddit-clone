'use client';

import { ArrowBigDown, ArrowBigUp } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { usePrevious } from '@mantine/hooks';
import { useState, type FC, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useCustomToast } from '@/hooks/use-custom-toast';
import type { PostVoteRequest } from '@/lib/validators/vote';
import type { VoteType } from '@prisma/client';

interface PostVoteClientProps {
  postId: string;
  initialVotesAmount: number;
  initialVote?: VoteType | null;
}

const PostVoteClient: FC<PostVoteClientProps> = ({
  postId,
  initialVotesAmount,
  initialVote,
}) => {
  const { loginToast } = useCustomToast();
  const [votesAmount, setVotesAmount] = useState<number>(initialVotesAmount);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const previousVote = usePrevious(currentVote);
  const { mutate: castVote } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload: PostVoteRequest = {
        postId,
        voteType: type,
      };
      await axios.patch('/api/subreddit/post/vote', payload);
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
    onMutate: (type: VoteType) => {
      // Optimistic Update
      if (currentVote === type) {
        setCurrentVote(undefined);
        if (type === 'UP') {
          setVotesAmount((prev) => prev - 1);
        } else {
          setVotesAmount((prev) => prev + 1);
        }
      } else {
        setCurrentVote(type);
        if (type === 'UP') {
          setVotesAmount((prev) => prev + (currentVote ? 2 : 1));
        } else {
          setVotesAmount((prev) => prev - (currentVote ? 2 : 1));
        }
      }
    },
  });

  // sync with server
  useEffect(() => {
    setCurrentVote(initialVote);
  }, [initialVote]);

  return (
    <div className="flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0">
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
            currentVote === 'UP' && 'text-emerald-500 fill-emerald-500'
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
            currentVote === 'DOWN' && 'text-red-500 fill-red-500'
          )}
        />
      </Button>
    </div>
  );
};

export default PostVoteClient;
