'use client';

import { Button } from '@/components/ui/button';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { toast } from '@/hooks/use-toast';
import { SubscribeToSubredditPayload } from '@/lib/validators/subreddit';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { FC, startTransition } from 'react';

interface SubscribeLeaveToggleProps {
  isSubscribed: boolean;
  subredditId: string;
  subredditName: string;
}

const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({
  isSubscribed,
  subredditId,
  subredditName,
}) => {
  const { loginToast } = useCustomToast();
  const router = useRouter();
  const { mutate: subscribeToSubreddit, isLoading: isSubscribingLoading } =
    useMutation({
      mutationFn: async () => {
        const payload: SubscribeToSubredditPayload = {
          subredditId,
        };

        const { data } = await axios.post('/api/subreddit/subscribe', payload);
        return data as string;
      },
      onError: (error) => {
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            return loginToast();
          }
        }

        return toast({
          title: 'Something went wrong',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      },
      onSuccess: () => {
        startTransition(() => {
          router.refresh();
        });

        return toast({
          title: 'Subscribed',
          description: `You are now subscribed to r/${subredditName}.`,
        });
      },
    });
  const { mutate: leaveSubreddit, isLoading: isLeavingLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubredditPayload = {
        subredditId,
      };

      const { data } = await axios.post('/api/subreddit/unsubscribe', payload);
      return data as string;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: 'Something went wrong',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: 'Unsubscribed',
        description: `You are now unsubscribed from r/${subredditName}.`,
      });
    },
  });

  return isSubscribed ? (
    <Button
      className="w-full mt-1 mb-4"
      isLoading={isLeavingLoading}
      disabled={isLeavingLoading}
      onClick={() => leaveSubreddit()}
    >
      Leave community
    </Button>
  ) : (
    <Button
      className="w-full mt-1 mb-4"
      isLoading={isSubscribingLoading}
      disabled={isSubscribingLoading}
      onClick={() => subscribeToSubreddit()}
    >
      Join to post
    </Button>
  );
};

export default SubscribeLeaveToggle;
