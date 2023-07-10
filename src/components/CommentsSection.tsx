import type { FC } from 'react';

import { db } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';
import CreateComment from './CreateComment';
import PostComment from './PostComment';

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection: FC<CommentsSectionProps> = async ({ postId }) => {
  const session = await getAuthSession();
  const comments = await db.comment.findMany({
    where: {
      postId,
      replyToId: null,
    },
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />
      <CreateComment postId={postId} />

      <div className="flex flex-col gap-y-6 pt-4">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentVoteAmount = topLevelComment.votes.reduce(
              (acc, vote) => {
                if (vote.type === 'UP') {
                  return acc + 1;
                } else {
                  return acc - 1;
                }
              },
              0
            );

            const topLevelCommentVote = topLevelComment.votes.find(
              (vote) => vote.userId === session?.user.id
            );

            return (
              <div className="flex flex-col" key={topLevelComment.id}>
                <div className="mb-2">
                  <PostComment comment={topLevelComment} />
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommentsSection;