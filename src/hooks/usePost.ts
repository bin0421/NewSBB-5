"use client";

import type { PostFormValues } from "@/components/PostForm";
import { alertError, apiFetch } from "@/lib/backend/client";
import type { PostWithContentDto, RsData } from "@/type/post";
import { useEffect, useState } from "react";

/**
 * 글 한 건의 데이터와 그 글에 대한 API 호출을 묶은 훅.
 * 화면 처리(알림, 이동)는 하지 않고, 변경 함수는 응답을 Promise 로 돌려준다.
 * 함수들은 훅이 받은 id 를 기억하므로(클로저) 다시 넘길 필요가 없다.
 */
export function usePost(id: number) {
  // 초기값을 null 로 두어야 "로딩중"을 구분할 수 있다.
  const [post, setPost] = useState<PostWithContentDto | null>(null);

  useEffect(() => {
    apiFetch(`/api/v1/posts/${id}`).then(setPost).catch(alertError);
  }, [id]);

  const deletePost = (): Promise<RsData<null>> =>
    apiFetch(`/api/v1/posts/${id}`, { method: "DELETE" });

  const modifyPost = (values: PostFormValues): Promise<RsData<null>> =>
    apiFetch(`/api/v1/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(values),
    });

  return { post, deletePost, modifyPost };
}
