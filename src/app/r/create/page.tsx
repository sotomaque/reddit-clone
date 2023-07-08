'use client';

import axois, { AxiosError } from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import type { CreateSubredditPayload } from '@/lib/validators/subreddit';
import { toast } from '@/hooks/use-toast';
import { useCustomToast } from '@/hooks/use-custom-toast';

export default function CreatePage() {
  const [input, setInput] = useState('');
  const router = useRouter();
  const { loginToast } = useCustomToast();
  const { mutateAsync: createCommunity, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: CreateSubredditPayload = {
        name: input,
      };
      const response = await axois.post('/api/subreddit', payload);
      return response.data as string;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 409) {
          return toast({
            title: 'Subreddit already exists.',
            description: 'Please try another name.',
            variant: 'destructive',
          });
        }

        if (error.response?.status === 422) {
          return toast({
            title: 'Invalid subreddit name.',
            description: 'Please choose a name between 3 and 21 characters.',
            variant: 'destructive',
          });
        }

        if (error.response?.status === 401) {
          return loginToast();
        }
      }

      toast({
        title: 'Something went wrong.',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    },
    onSuccess: (data) => {
      router.push(`/r/${data}`);
    },
  });

  const onCancel = () => {
    router.back();
  };

  const onCreate = async () => {
    await createCommunity();
  };

  return (
    <div className="container flex items-center h-full max-w-3xl mx-auto">
      <div className="relative bg-white w-full h-fit p-4 rounded-lg space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Create Community</h1>
        </div>

        <hr className="bg-zinc-500 h-px" />

        <div className="">
          <p className="text-lg font-medium">Name</p>
          <p className="text-xs pb-2">
            Community names including capitalization cannot be changed
          </p>
          <div className="relative">
            <p className="absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400">
              r/
            </p>
            <Input
              className="pl-6"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant={'ghost'} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            isLoading={isLoading}
            disabled={input.length === 0}
            onClick={onCreate}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
