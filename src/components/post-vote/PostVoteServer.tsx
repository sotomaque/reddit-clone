import type { FC } from 'react';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';

import type { Post, Vote, VoteType } from '@prisma/client';
import PostVoteClient from './PostVoteClient';

interface PostVoteServerProps {
  postId: string;
  initialVotesAmount?: number;
  initialVote?: VoteType | null;
  getData?: () => Promise<
    | (Post & {
        votes: Vote[];
      })
    | null
  >;
}

const PostVoteServer: FC<PostVoteServerProps> = async ({
  postId,
  initialVotesAmount,
  initialVote,
  getData,
}) => {
  const session = await getServerSession();

  let _votesAmount: number = 0;
  let _currentVote: VoteType | null | undefined = undefined;

  if (getData) {
    const post = await getData();
    if (!post) {
      return notFound();
    }

    _votesAmount = post.votes.reduce((acc, vote) => {
      if (vote.type === 'UP') {
        return acc + 1;
      } else {
        return acc - 1;
      }
    }, 0);

    _currentVote = post.votes.find(
      (vote) => vote.userId === session?.user.id
    )?.type;
  } else {
    _votesAmount = initialVotesAmount || 0;
    _currentVote = initialVote;
  }

  return (
    <PostVoteClient
      initialVotesAmount={_votesAmount}
      postId={postId}
      initialVote={_currentVote}
    />
  );
};

export default PostVoteServer;
