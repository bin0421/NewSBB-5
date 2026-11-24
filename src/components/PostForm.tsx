"use client";

import { POST_CONTENT, POST_TITLE, validateField } from "@/lib/validation";

export type PostFormValues = {
  title: string;
  content: string;
};

type PostFormProps = {
  defaultValues?: PostFormValues;
  onSubmit: (values: PostFormValues) => void;
};

/** 글 작성/수정에서 공통으로 쓰는 폼. 앞뒤 공백을 지우고 길이 규칙에 맞지 않으면 경고한다. */
export default function PostForm({ defaultValues, onSubmit }: PostFormProps) {
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const titleInput = form.elements.namedItem("title") as HTMLInputElement;
    const contentTextarea = form.elements.namedItem(
      "content",
    ) as HTMLTextAreaElement;

    if (!validateField(titleInput, POST_TITLE)) return;
    if (!validateField(contentTextarea, POST_CONTENT)) return;

    onSubmit({ title: titleInput.value, content: contentTextarea.value });
  };

  return (
    <form className="flex flex-col gap-2 p-2" onSubmit={handleSubmit}>
      <input
        className="border p-2 rounded"
        type="text"
        name="title"
        placeholder="제목"
        maxLength={POST_TITLE.max}
        autoFocus
        defaultValue={defaultValues?.title}
      />
      <textarea
        className="border p-2 rounded"
        name="content"
        placeholder="내용"
        maxLength={POST_CONTENT.max}
        rows={10}
        defaultValue={defaultValues?.content}
      />
      <button className="border p-2 rounded" type="submit">
        저장
      </button>
    </form>
  );
}
