"use client";

import { usePostComments } from "@/hooks/usePostComments";
import { alertError } from "@/lib/backend/client";
import { COMMENT_CONTENT, validateField } from "@/lib/validation";

export default function PostCommentSection({ postId }: { postId: number }) {
  const { postComments, writeComment, deleteComment } = usePostComments(postId);

  const handleDeleteClick = (commentId: number) => {
    if (!confirm(`${commentId}번 댓글을 정말로 삭제하시겠습니까?`)) return;

    deleteComment(commentId)
      .then((data) => alert(data.msg))
      .catch(alertError);
  };

  const handleCommentWriteFormSubmit = (
    e: React.SyntheticEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    const form = e.currentTarget;

    const contentTextarea = form.elements.namedItem(
      "content",
    ) as HTMLTextAreaElement;

    if (!validateField(contentTextarea, COMMENT_CONTENT)) return;

    writeComment(contentTextarea.value)
      .then((data) => {
        alert(data.msg);

        contentTextarea.value = "";
      })
      .catch(alertError);
  };

  return (
    <>
      <h2>댓글 작성</h2>

      <form className="flex gap-2" onSubmit={handleCommentWriteFormSubmit}>
        <textarea
          className="border p-2 rounded"
          name="content"
          placeholder="댓글 내용"
          maxLength={COMMENT_CONTENT.max}
          rows={5}
        />
        <button className="p-2 rounded border cursor-pointer" type="submit">
          작성
        </button>
      </form>

      <hr className="my-2" />

      <h2>댓글 목록</h2>

      {postComments == null && <div>댓글 로딩중...</div>}

      {postComments != null && postComments.length == 0 && (
        <div>댓글이 없습니다.</div>
      )}

      {postComments != null && postComments.length > 0 && (
        <ul>
          {postComments.map((comment) => (
            <li key={comment.id} className="py-2">
              {comment.id} : {comment.content}
              <button
                className="ml-2 p-2 rounded border cursor-pointer"
                onClick={() => handleDeleteClick(comment.id)}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
