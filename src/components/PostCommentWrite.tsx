"use client";

import PostCommentForm from "@/components/PostCommentForm";
import type { RsData } from "@/type/post";

type PostCommentWriteProps = {
  writeComment: (content: string) => Promise<RsData<unknown>>;
};

/** 댓글 작성 폼. 성공하면 알리고 입력 칸을 비운다. */
export default function PostCommentWrite({
  writeComment,
}: PostCommentWriteProps) {
  const handleSubmit = (content: string) =>
    writeComment(content).then((data) => alert(data.msg));

  return (
    <>
      <h2>댓글 작성</h2>

      <PostCommentForm
        submitLabel="작성"
        onSubmit={handleSubmit}
        clearOnSuccess
      />
    </>
  );
}
