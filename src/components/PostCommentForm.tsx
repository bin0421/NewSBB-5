"use client";

import { alertError } from "@/lib/backend/client";
import { COMMENT_CONTENT, validateField } from "@/lib/validation";

type PostCommentFormProps = {
  submitLabel: string;
  onSubmit: (content: string) => Promise<unknown>;
  defaultValue?: string;
  autoFocus?: boolean;
  clearOnSuccess?: boolean;
  className?: string;
};

/**
 * 댓글 작성·수정에서 공통으로 쓰는 폼.
 * 앞뒤 공백을 지우고 길이 규칙을 검사한 뒤 onSubmit 을 부른다.
 * onSubmit 이 돌려준 Promise 가 실패하면 알리고, 성공하면 필요할 때 입력 칸을 비운다.
 */
export default function PostCommentForm({
  submitLabel,
  onSubmit,
  defaultValue,
  autoFocus,
  clearOnSuccess,
  className = "flex gap-2",
}: PostCommentFormProps) {
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const contentTextarea = form.elements.namedItem(
      "content",
    ) as HTMLTextAreaElement;

    if (!validateField(contentTextarea, COMMENT_CONTENT)) return;

    onSubmit(contentTextarea.value)
      .then(() => {
        if (clearOnSuccess) contentTextarea.value = "";
      })
      .catch(alertError);
  };

  return (
    <form className={className} onSubmit={handleSubmit}>
      <textarea
        className="border p-2 rounded"
        name="content"
        placeholder="댓글 내용"
        maxLength={COMMENT_CONTENT.max}
        rows={5}
        defaultValue={defaultValue}
        autoFocus={autoFocus}
      />
      <button className="p-2 rounded border cursor-pointer" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
