"use client";

import PostForm, { type PostFormValues } from "@/components/PostForm";
import { apiFetch } from "@/lib/backend/client";
import type { PostWithContentDto, RsData } from "@/type/post";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const writePost = (values: PostFormValues) => {
    apiFetch(`/api/v1/posts`, {
      method: "POST",
      body: JSON.stringify(values),
    }).then((data: RsData<PostWithContentDto>) => {
      alert(data.msg);

      // replace : 작성 완료 후 뒤로가기로 글쓰기 페이지에 돌아오지 않도록
      router.replace(`/posts/${data.data.id}`);
    });
  };

  return (
    <>
      <h1>글쓰기</h1>

      <PostForm onSubmit={writePost} />
    </>
  );
}
