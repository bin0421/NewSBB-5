"use client";

import PostForm, { type PostFormValues } from "@/components/PostForm";
import { usePost } from "@/hooks/usePost";
import { alertError } from "@/lib/backend/client";
import { useParams, useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const { id: idStr } = useParams<{ id: string }>();
  const id = Number(idStr);

  const { post, modifyPost } = usePost(id);

  const handleSubmit = (values: PostFormValues) => {
    modifyPost(values)
      .then((data) => {
        alert(data.msg);

        router.replace(`/posts/${id}`);
      })
      .catch(alertError);
  };

  if (post == null) return <div>로딩중...</div>;

  return (
    <>
      <h1>{id}번 글 수정</h1>

      <PostForm defaultValues={post} onSubmit={handleSubmit} />
    </>
  );
}
