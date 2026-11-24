import PostDetailPage from "@/app/posts/[id]/page";
import PostEditPage from "@/app/posts/[id]/edit/page";
import PostListPage from "@/app/posts/page";
import PostWritePage from "@/app/posts/write/page";
import { ApiError, apiFetch } from "@/lib/backend/client";
import { comment, samplePost } from "@/test/fixtures";
import { mockFetch, type MockRoute } from "@/test/mockFetch";
import { resetNavigation, routerMock } from "@/test/mockNavigation";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", async () => (await import("@/test/mockNavigation")).navigationModule);

const notFound = {
  status: 404,
  body: { resultCode: "404-1", msg: "해당 데이터가 존재하지 않습니다.", data: null },
};

const badRequest = {
  status: 400,
  body: { resultCode: "400-1", msg: "요청 본문이 올바르지 않습니다.", data: null },
};

const detailRoutes: MockRoute[] = [
  { url: "/api/v1/posts/1", body: samplePost },
  { url: "/api/v1/posts/1/comments", body: [comment(1, "댓글 1")] },
];

const spyDialogs = () => {
  vi.spyOn(window, "confirm").mockReturnValue(true);
  return vi.spyOn(window, "alert").mockImplementation(() => {});
};

describe("apiFetch 실패 응답", () => {
  it("4xx·5xx 응답이면 resultCode, msg 를 담은 ApiError 로 reject 한다", async () => {
    mockFetch([{ url: "/api/v1/posts/999", ...notFound }]);

    const error = await apiFetch("/api/v1/posts/999").catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 404,
      resultCode: "404-1",
      msg: "해당 데이터가 존재하지 않습니다.",
    });
  });
});

describe("화면의 API 오류 처리", () => {
  beforeEach(() => resetNavigation({ id: "1" }));

  it("글 목록 : 불러오기에 실패하면 resultCode : msg 를 알린다", async () => {
    mockFetch([{ url: "/api/v1/posts", status: 500, body: { resultCode: "500-1", msg: "서버 오류", data: null } }]);
    const alertSpy = spyDialogs();

    render(<PostListPage />);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith("500-1 : 서버 오류"));
  });

  it("글 상세 : 없는 글이면 알린다", async () => {
    resetNavigation({ id: "999" });
    mockFetch([
      { url: "/api/v1/posts/999", ...notFound },
      { url: "/api/v1/posts/999/comments", ...notFound },
    ]);
    const alertSpy = spyDialogs();

    render(<PostDetailPage />);

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("404-1 : 해당 데이터가 존재하지 않습니다."),
    );
  });

  it("글쓰기 : 작성에 실패하면 알리고 이동하지 않는다", async () => {
    mockFetch([{ method: "POST", url: "/api/v1/posts", ...badRequest }]);
    const alertSpy = spyDialogs();

    render(<PostWritePage />);
    await userEvent.type(screen.getByPlaceholderText("제목"), "새 제목");
    await userEvent.type(screen.getByPlaceholderText("내용"), "새 내용");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("400-1 : 요청 본문이 올바르지 않습니다."),
    );
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it("글 수정 : 수정에 실패하면 알리고 이동하지 않는다", async () => {
    mockFetch([...detailRoutes, { method: "PUT", url: "/api/v1/posts/1", ...badRequest }]);
    const alertSpy = spyDialogs();

    render(<PostEditPage />);
    await screen.findByPlaceholderText("제목");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("400-1 : 요청 본문이 올바르지 않습니다."),
    );
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it("글 삭제 : 삭제에 실패하면 알리고 이동하지 않는다", async () => {
    mockFetch([...detailRoutes, { method: "DELETE", url: "/api/v1/posts/1", ...notFound }]);
    const alertSpy = spyDialogs();

    render(<PostDetailPage />);
    await screen.findByText(/댓글 1/);
    const [postDeleteButton] = screen.getAllByRole("button", { name: "삭제" });
    await userEvent.click(postDeleteButton);

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("404-1 : 해당 데이터가 존재하지 않습니다."),
    );
    expect(routerMock.replace).not.toHaveBeenCalled();
  });

  it("댓글 작성 : 실패하면 알리고, 입력한 내용과 목록을 그대로 둔다", async () => {
    mockFetch([
      ...detailRoutes,
      { method: "POST", url: "/api/v1/posts/1/comments", ...badRequest },
    ]);
    const alertSpy = spyDialogs();

    render(<PostDetailPage />);
    await screen.findByText(/댓글 1/);
    const textarea = screen.getByPlaceholderText("댓글 내용");
    await userEvent.type(textarea, "새 댓글");
    await userEvent.click(screen.getByRole("button", { name: "작성" }));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("400-1 : 요청 본문이 올바르지 않습니다."),
    );
    expect(textarea).toHaveValue("새 댓글");
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("댓글 삭제 : 실패하면 알리고 댓글을 목록에 그대로 둔다", async () => {
    mockFetch([
      ...detailRoutes,
      { method: "DELETE", url: "/api/v1/posts/1/comments/1", ...notFound },
    ]);
    const alertSpy = spyDialogs();

    render(<PostDetailPage />);
    const [item] = await screen.findAllByRole("listitem");
    await userEvent.click(within(item).getByRole("button", { name: "삭제" }));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("404-1 : 해당 데이터가 존재하지 않습니다."),
    );
    expect(screen.getByText(/댓글 1/)).toBeInTheDocument();
  });
});
