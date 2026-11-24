"use client";

import PostCommentSection from "@/components/PostCommentSection";
import PostInfo from "@/components/PostInfo";
import { usePost } from "@/hooks/usePost";
import { alertError } from "@/lib/backend/client";
import { useParams, useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const { id: idStr } = useParams<{ id: string }>();
  const id = Number(idStr);

  const { post, deletePost } = usePost(id);

  if (post == null) return <div>로딩중...</div>;

  const handleDelete = () => {
    deletePost()
      .then((data) => {
        alert(data.msg);

        router.replace("/posts");
      })
      .catch(alertError);
  };

  return (
    <>
      <h1>글 상세페이지</h1>

      <PostInfo post={post} onDelete={handleDelete} />

      <hr className="my-2" />

      <PostCommentSection postId={id} />
    </>
  );
}
