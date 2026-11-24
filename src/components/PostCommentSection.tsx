"use client";

import { apiFetch } from "@/lib/backend/client";
import { COMMENT_CONTENT, validateField } from "@/lib/validation";
import type { PostCommentDto, RsData } from "@/type/post";
import { useEffect, useState } from "react";

export default function PostCommentSection({ postId }: { postId: number }) {
  // 초기값을 null 로 두어야 "댓글 로딩중"과 "댓글 없음"을 구분할 수 있다.
  const [postComments, setPostComments] = useState<PostCommentDto[] | null>(
    null,
  );

  const deleteComment = (commentId: number) => {
    apiFetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    }).then((data: RsData<null>) => {
      alert(data.msg);

      // 요청이 성공하면 상태에서도 제거하여 UI 에 바로 반영
      setPostComments(
        (prev) => prev?.filter((c) => c.id != commentId) ?? prev,
      );
    });
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

    apiFetch(`/api/v1/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({
        content: contentTextarea.value,
      }),
    }).then((data: RsData<PostCommentDto>) => {
      alert(data.msg);

      contentTextarea.value = "";

      // 요청이 성공하면 상태에도 추가하여 UI 에 바로 반영
      setPostComments((prev) => (prev == null ? prev : [...prev, data.data]));
    });
  };

  useEffect(() => {
    apiFetch(`/api/v1/posts/${postId}/comments`).then(setPostComments);
  }, [postId]);

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
                onClick={() =>
                  confirm(`${comment.id}번 댓글을 정말로 삭제하시겠습니까?`) &&
                  deleteComment(comment.id)
                }
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
