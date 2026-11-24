"use client";

import PostCommentForm from "@/components/PostCommentForm";
import { alertError } from "@/lib/backend/client";
import type { PostCommentDto, RsData } from "@/type/post";
import { useState } from "react";

type PostCommentListItemProps = {
  comment: PostCommentDto;
  deleteComment: (commentId: number) => Promise<RsData<unknown>>;
  modifyComment: (
    commentId: number,
    content: string,
  ) => Promise<RsData<unknown>>;
};

/** 댓글 한 건. 수정 모드에서는 내용 대신 수정 폼을 보여준다. */
export default function PostCommentListItem({
  comment,
  deleteComment,
  modifyComment,
}: PostCommentListItemProps) {
  const [modifyMode, setModifyMode] = useState(false);

  const handleDeleteClick = () => {
    if (!confirm(`${comment.id}번 댓글을 정말로 삭제하시겠습니까?`)) return;

    deleteComment(comment.id)
      .then((data) => alert(data.msg))
      .catch(alertError);
  };

  const handleModifySubmit = (content: string) =>
    modifyComment(comment.id, content).then((data) => {
      alert(data.msg);

      setModifyMode(false);
    });

  return (
    <li className="py-2">
      {comment.id} : {!modifyMode && comment.content}
      {modifyMode && (
        <PostCommentForm
          className="inline-flex gap-2"
          submitLabel="저장"
          onSubmit={handleModifySubmit}
          defaultValue={comment.content}
          autoFocus
        />
      )}
      <button
        className="ml-2 p-2 rounded border cursor-pointer"
        onClick={() => setModifyMode((prev) => !prev)}
      >
        {modifyMode ? "수정취소" : "수정"}
      </button>
      <button
        className="ml-2 p-2 rounded border cursor-pointer"
        onClick={handleDeleteClick}
      >
        삭제
      </button>
    </li>
  );
}
