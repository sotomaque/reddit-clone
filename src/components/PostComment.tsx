'use client';

import { useRef, type FC } from 'react';
import UserAvatar from './UserAvatar';
import type { Comment, CommentVote, User } from '@prisma/client';
import { formatTimeToNow } from '@/lib/utils';

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface PostCommentProps {
  comment: ExtendedComment;
}

const PostComment: FC<PostCommentProps> = ({ comment }) => {
  const commentRef = useRef<HTMLDivElement>(null);

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

      {/* TODO: Replies */}
    </div>
  );
};

export default PostComment;
