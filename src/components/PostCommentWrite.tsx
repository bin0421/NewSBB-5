"use client";

import { alertError } from "@/lib/backend/client";
import { COMMENT_CONTENT, validateField } from "@/lib/validation";
import type { RsData } from "@/type/post";

type PostCommentWriteProps = {
  writeComment: (content: string) => Promise<RsData<unknown>>;
};

/** 댓글 작성 폼. 성공하면 알리고 입력 칸을 비운다. */
export default function PostCommentWrite({
  writeComment,
}: PostCommentWriteProps) {
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
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

      <form className="flex gap-2" onSubmit={handleSubmit}>
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
    </>
  );
}
