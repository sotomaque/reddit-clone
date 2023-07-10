'use client';

import { useRef, type FC, useState } from 'react';

import { CommentVotes } from './CommentVotes';
import { formatTimeToNow } from '@/lib/utils';
import type { Comment, CommentVote, User } from '@prisma/client';
import UserAvatar from './UserAvatar';
import { Button } from './ui/button';
import { MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useMutation } from '@tanstack/react-query';
import type { CommentRequest } from '@/lib/validators/comment';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface PostCommentProps {
  comment: ExtendedComment;
  votesAmount: number;
  currentVote?: CommentVote | undefined;
  postId: string;
}

const PostComment: FC<PostCommentProps> = ({
  comment,
  votesAmount,
  currentVote,
  postId,
}) => {
  const commentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const [isReplying, setIsReplying] = useState(false);
  const [input, setInput] = useState('');
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
    onSuccess: () => {
      setInput('');
      setIsReplying(false);
      router.refresh();
    },
    onError: () => {
      return toast({
        title: 'Something went wrong.',
        description:
          'Comment was not posted successfully. Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const handleOnReply = () => {
    if (!session) {
      return router.push('/sign-in');
    } else {
      setIsReplying(true);
    }
  };

  return (
    <div className="flex flex-col" ref={commentRef}>
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.username || comment.author.name || '',
            image: comment.author.image || '',
          }}
          className="h-6 w-6"
        />

        {/* Metadata */}
        <div className="ml-2 flex items-center gap-x-2">
          {/* User */}
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>
          {/* Time */}
          <p className="max-h-40 truncate text-xs text-zinc-900">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      {/* Content */}
      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

      <div className="flex gap-2 items-center flex-wrap">
        <CommentVotes
          commentId={comment.id}
          initialVotesAmount={votesAmount}
          initialVote={currentVote}
        />

        <Button onClick={handleOnReply} variant={'ghost'} size="sm">
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>

        {isReplying && (
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
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  tabIndex={-1}
                  variant={'secondary'}
                  onClick={() => setIsReplying(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!input.trim()) {
                      return;
                    }

                    postComment({
                      postId,
                      text: input,
                      replyToId: comment.replyToId ?? comment.id,
                    });
                  }}
                  isLoading={isLoading}
                  disabled={input.length === 0}
                >
                  Reply
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostComment;
