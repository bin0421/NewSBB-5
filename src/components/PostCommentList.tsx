import PostCommentListItem from "@/components/PostCommentListItem";
import type { PostCommentDto, RsData } from "@/type/post";

type PostCommentListProps = {
  postComments: PostCommentDto[] | null;
  deleteComment: (commentId: number) => Promise<RsData<unknown>>;
  modifyComment: (
    commentId: number,
    content: string,
  ) => Promise<RsData<unknown>>;
};

/** 댓글 목록. null 이면 아직 불러오는 중이다. */
export default function PostCommentList({
  postComments,
  deleteComment,
  modifyComment,
}: PostCommentListProps) {
  return (
    <>
      <h2>댓글 목록</h2>

      {postComments == null && <div>댓글 로딩중...</div>}

      {postComments != null && postComments.length == 0 && (
        <div>댓글이 없습니다.</div>
      )}

      {postComments != null && postComments.length > 0 && (
        <ul>
          {postComments.map((comment) => (
            <PostCommentListItem
              key={comment.id}
              comment={comment}
              deleteComment={deleteComment}
              modifyComment={modifyComment}
            />
          ))}
        </ul>
      )}
    </>
  );
}
