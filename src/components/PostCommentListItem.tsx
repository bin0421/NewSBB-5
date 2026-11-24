"use client";

import { alertError } from "@/lib/backend/client";
import { COMMENT_CONTENT, validateField } from "@/lib/validation";
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

  const handleModifySubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const contentTextarea = form.elements.namedItem(
      "content",
    ) as HTMLTextAreaElement;

    if (!validateField(contentTextarea, COMMENT_CONTENT)) return;

    modifyComment(comment.id, contentTextarea.value)
      .then((data) => {
        alert(data.msg);

        setModifyMode(false);
      })
      .catch(alertError);
  };

  return (
    <li className="py-2">
      {comment.id} : {!modifyMode && comment.content}
      {modifyMode && (
        <form className="inline-flex gap-2" onSubmit={handleModifySubmit}>
          <textarea
            className="border p-2 rounded"
            name="content"
            placeholder="댓글 내용"
            maxLength={COMMENT_CONTENT.max}
            rows={5}
            defaultValue={comment.content}
            autoFocus
          />
          <button className="p-2 rounded border cursor-pointer" type="submit">
            저장
          </button>
        </form>
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
