'use client';

import { MessageSquare } from 'lucide-react';
import { useRef, type FC } from 'react';
import type { Post, User, Vote } from '@prisma/client';

import { formatTimeToNow } from '@/lib/utils';
import EditorOutput from './EditorOutput';
import PostVoteClient from './post-vote/PostVoteClient';

type PartialVote = Pick<Vote, 'type'>;

interface PostProps {
  post: Post & {
    author: User;
    votes: Vote[];
  };
  subredditName: string;
  commentAmount: number;
  votesAmount: number;
  currentVote?: PartialVote;
}

const Post: FC<PostProps> = ({
  post,
  subredditName,
  commentAmount,
  votesAmount,
  currentVote,
}) => {
  const postRef = useRef<HTMLDivElement>(null);

  return (
    <div className="rounded-md bg-white shadow">
      <div className="px-6 py-4 flex justify-between">
        {/* Votes */}
        <PostVoteClient
          initialVote={currentVote?.type}
          postId={post.id}
          initialVotesAmount={votesAmount}
        />

        <div className="w-0 flex-1">
          {/* Metadata */}
          <div className="max-h-40 mt-1 text-xs text-gray-500">
            {subredditName ? (
              <>
                <a
                  href={`/r/${subredditName}`}
                  className="underline text-zinc-900 text-sm underline-offset-2"
                >
                  r/{subredditName}
                </a>
                <span className="px-1">·</span>
              </>
            ) : null}
            <span>Posted by u/{post.author.username}</span>{' '}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>

          {/* Title */}
          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900">
              {post.title}
            </h1>
          </a>

          {/* Content */}
          <div
            className="relative text-sm  w-full h-fit overfolw-clip"
            ref={postRef}
          >
            <EditorOutput content={post.content} />
            {/* Gradient on large posts */}
            {postRef.current?.clientHeight === 160 ? (
              <div className="absolute bottom-0 left-0 h-24 bg-gradient-to-t from-white to-transparent" />
            ) : null}
          </div>
        </div>
      </div>

      {/* Link to Comments */}
      <div className="bg-gray-50 z-20 text-sm p-4 sm:px-6">
        <a
          href={`/r/${subredditName}/post/${post.id}`}
          className="w-fit flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          {commentAmount} {commentAmount > 1 ? 'comments' : 'comment'}
        </a>
      </div>
    </div>
  );
};

export default Post;
