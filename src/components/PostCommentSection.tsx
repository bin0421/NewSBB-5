"use client";

import PostCommentList from "@/components/PostCommentList";
import PostCommentWrite from "@/components/PostCommentWrite";
import { usePostComments } from "@/hooks/usePostComments";

/** 글 상세의 댓글 영역. 데이터는 훅에서 받아 하위 컴포넌트에 필요한 것만 넘긴다. */
export default function PostCommentSection({ postId }: { postId: number }) {
  const { postComments, writeComment, deleteComment } = usePostComments(postId);

  return (
    <>
      <PostCommentWrite writeComment={writeComment} />

      <hr className="my-2" />

      <PostCommentList
        postComments={postComments}
        deleteComment={deleteComment}
      />
    </>
  );
}
