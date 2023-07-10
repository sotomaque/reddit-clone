'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, type FC } from 'react';
import axios, { AxiosError } from 'axios';

import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useCustomToast } from '@/hooks/use-custom-toast';
import type { CommentRequest } from '@/lib/validators/comment';

interface CreateCommentProps {
  postId: string;
  replyToId?: string;
}

const CreateComment: FC<CreateCommentProps> = ({ postId, replyToId }) => {
  const [input, setInput] = useState('');
  const { loginToast } = useCustomToast();
  const router = useRouter();
  const { mutate: postComment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      };
      const { data } = await axios.post('/api/subreddit/post/comment', payload);
      return data;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: 'There was a problem',
        description: 'Something went wrong. Please try again later.',
        variant: 'destructive',
      });
    },
    onSuccess: () => {
      router.refresh();
      setInput('');
    },
  });

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">Your comment</Label>
      <div className="mt-2">
        <Textarea
          id="comment"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          placeholder="What are your thoughts?"
        />
        <div className="mt-2 flex justify-end">
          <Button
            onClick={() => {
              postComment({
                postId,
                text: input,
                replyToId,
              });
            }}
            disabled={input.length === 0}
            isLoading={isLoading}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
