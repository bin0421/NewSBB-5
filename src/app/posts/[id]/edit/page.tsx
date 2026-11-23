"use client";

import PostForm, { type PostFormValues } from "@/components/PostForm";
import { apiFetch } from "@/lib/backend/client";
import type { PostWithContentDto, RsData } from "@/type/post";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
  const router = useRouter();

  const { id: idStr } = useParams<{ id: string }>();
  const id = Number(idStr);

  const [post, setPost] = useState<PostWithContentDto | null>(null);

  useEffect(() => {
    apiFetch(`/api/v1/posts/${id}`).then(setPost);
  }, [id]);

  const modifyPost = (values: PostFormValues) => {
    apiFetch(`/api/v1/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(values),
    }).then((data: RsData<null>) => {
      alert(data.msg);

      router.replace(`/posts/${id}`);
    });
  };

  if (post == null) return <div>로딩중...</div>;

  return (
    <>
      <h1>{id}번 글 수정</h1>

      <PostForm defaultValues={post} onSubmit={modifyPost} />
    </>
  );
}
