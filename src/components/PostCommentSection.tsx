"use client";

import { apiFetch } from "@/lib/backend/client";
import type { PostCommentDto } from "@/type/post";
import { useEffect, useState } from "react";

export default function PostCommentSection({ postId }: { postId: number }) {
  // 초기값을 null 로 두어야 "댓글 로딩중"과 "댓글 없음"을 구분할 수 있다.
  const [postComments, setPostComments] = useState<PostCommentDto[] | null>(
    null,
  );

  useEffect(() => {
    apiFetch(`/api/v1/posts/${postId}/comments`).then(setPostComments);
  }, [postId]);

  return (
    <>
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
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
