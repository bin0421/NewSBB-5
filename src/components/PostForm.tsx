"use client";

export type PostFormValues = {
  title: string;
  content: string;
};

type PostFormProps = {
  defaultValues?: PostFormValues;
  onSubmit: (values: PostFormValues) => void;
};

/** 글 작성/수정에서 공통으로 쓰는 폼. 앞뒤 공백 제거 후 빈 값이면 경고한다. */
export default function PostForm({ defaultValues, onSubmit }: PostFormProps) {
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;

    const titleInput = form.elements.namedItem("title") as HTMLInputElement;
    const contentTextarea = form.elements.namedItem(
      "content",
    ) as HTMLTextAreaElement;

    titleInput.value = titleInput.value.trim();

    if (titleInput.value.length === 0) {
      alert("제목을 입력해주세요.");
      titleInput.focus();

      return;
    }

    contentTextarea.value = contentTextarea.value.trim();

    if (contentTextarea.value.length === 0) {
      alert("내용을 입력해주세요.");
      contentTextarea.focus();

      return;
    }

    onSubmit({ title: titleInput.value, content: contentTextarea.value });
  };

  return (
    <form className="flex flex-col gap-2 p-2" onSubmit={handleSubmit}>
      <input
        className="border p-2 rounded"
        type="text"
        name="title"
        placeholder="제목"
        autoFocus
        defaultValue={defaultValues?.title}
      />
      <textarea
        className="border p-2 rounded"
        name="content"
        placeholder="내용"
        defaultValue={defaultValues?.content}
      />
      <button className="border p-2 rounded" type="submit">
        저장
      </button>
    </form>
  );
}
