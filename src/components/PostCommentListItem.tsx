"use client";

import { alertError } from "@/lib/backend/client";
import type { PostCommentDto, RsData } from "@/type/post";

type PostCommentListItemProps = {
  comment: PostCommentDto;
  deleteComment: (commentId: number) => Promise<RsData<unknown>>;
};

/** 댓글 한 건. 삭제는 확인을 받은 뒤 요청하고 결과를 알린다. */
export default function PostCommentListItem({
  comment,
  deleteComment,
}: PostCommentListItemProps) {
  const handleDeleteClick = () => {
    if (!confirm(`${comment.id}번 댓글을 정말로 삭제하시겠습니까?`)) return;

    deleteComment(comment.id)
      .then((data) => alert(data.msg))
      .catch(alertError);
  };

  return (
    <li className="py-2">
      {comment.id} : {comment.content}
      <button
        className="ml-2 p-2 rounded border cursor-pointer"
        onClick={handleDeleteClick}
      >
        삭제
      </button>
    </li>
  );
}
