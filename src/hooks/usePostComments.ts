"use client";

import { alertError, apiFetch } from "@/lib/backend/client";
import type { PostCommentDto, RsData } from "@/type/post";
import { useEffect, useState } from "react";

/**
 * 한 글의 댓글 목록과 댓글 API 호출을 묶은 훅.
 * 변경 함수는 요청이 성공하면 목록 상태에 바로 반영하고, 응답을 Promise 로 돌려준다.
 * 알림 같은 화면 처리는 하지 않는다.
 */
export function usePostComments(postId: number) {
  // 초기값을 null 로 두어야 "댓글 로딩중"과 "댓글 없음"을 구분할 수 있다.
  const [postComments, setPostComments] = useState<PostCommentDto[] | null>(
    null,
  );

  useEffect(() => {
    apiFetch(`/api/v1/posts/${postId}/comments`)
      .then(setPostComments)
      .catch(alertError);
  }, [postId]);

  const writeComment = (content: string) =>
    apiFetch(`/api/v1/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }).then((data: RsData<PostCommentDto>) => {
      setPostComments((prev) => (prev == null ? prev : [...prev, data.data]));

      return data;
    });

  const deleteComment = (commentId: number) =>
    apiFetch(`/api/v1/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
    }).then((data: RsData<null>) => {
      setPostComments((prev) => prev?.filter((c) => c.id != commentId) ?? prev);

      return data;
    });

  return { postComments, writeComment, deleteComment };
}
