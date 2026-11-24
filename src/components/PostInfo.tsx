import type { PostWithContentDto } from "@/type/post";
import Link from "next/link";

type PostInfoProps = {
  post: PostWithContentDto;
  onDelete: () => void;
};

/** 글 번호·제목·내용과 삭제·수정 버튼. 삭제는 확인을 받은 뒤 onDelete 를 부른다. */
export default function PostInfo({ post, onDelete }: PostInfoProps) {
  const handleDeleteClick = () => {
    if (!confirm(`${post.id}번 글을 정말로 삭제하시겠습니까?`)) return;

    onDelete();
  };

  return (
    <>
      <div>번호 : {post.id}</div>
      <div>제목: {post.title}</div>
      <div style={{ whiteSpace: "pre-line" }}>{post.content}</div>

      <div className="flex gap-2">
        <button
          className="p-2 rounded border cursor-pointer"
          onClick={handleDeleteClick}
        >
          삭제
        </button>
        <Link className="p-2 rounded border" href={`/posts/${post.id}/edit`}>
          수정
        </Link>
      </div>
    </>
  );
}
