import PostDetailPage from "@/app/posts/[id]/page";
import PostEditPage from "@/app/posts/[id]/edit/page";
import PostWritePage from "@/app/posts/write/page";
import {
  COMMENT_CONTENT,
  POST_CONTENT,
  POST_TITLE,
  checkLength,
} from "@/lib/validation";
import { comment, samplePost } from "@/test/fixtures";
import { mockFetch } from "@/test/mockFetch";
import { resetNavigation } from "@/test/mockNavigation";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", async () => (await import("@/test/mockNavigation")).navigationModule);

const postRoutes = [
  { url: "/api/v1/posts/1", body: samplePost },
  { url: "/api/v1/posts/1/comments", body: [comment(1, "댓글 1")] },
];

const sentMethods = (fetchMock: ReturnType<typeof mockFetch>) =>
  fetchMock.mock.calls.map(([, init]) => init?.method ?? "GET");

describe("길이 규칙", () => {
  it("규칙은 백엔드 요청 본문 제약과 같다", () => {
    expect(POST_TITLE).toMatchObject({ min: 2, max: 100 });
    expect(POST_CONTENT).toMatchObject({ min: 2, max: 5000 });
    expect(COMMENT_CONTENT).toMatchObject({ min: 2, max: 100 });
  });

  it("비었으면 입력, 짧으면 최소 길이 안내 문구를 돌려주고 통과하면 null", () => {
    expect(checkLength("", POST_TITLE)).toBe("제목을 입력해주세요.");
    expect(checkLength("가", POST_TITLE)).toBe("제목을 2자 이상 입력해주세요.");
    expect(checkLength("가나", POST_TITLE)).toBeNull();
    expect(checkLength("가", POST_CONTENT)).toBe("내용을 2자 이상 입력해주세요.");
    expect(checkLength("가", COMMENT_CONTENT)).toBe(
      "댓글 내용을 2자 이상 입력해주세요.",
    );
  });
});

describe("글 폼 유효성 검사", () => {
  beforeEach(() => resetNavigation({ id: "1" }));

  it("글쓰기 : 입력 칸에 최대 길이가 걸려 있다", () => {
    mockFetch([]);

    render(<PostWritePage />);

    expect(screen.getByPlaceholderText("제목")).toHaveAttribute("maxLength", "100");
    expect(screen.getByPlaceholderText("내용")).toHaveAttribute("maxLength", "5000");
  });

  it("글쓰기 : 제목이 1자면 경고하고 API 를 호출하지 않는다", async () => {
    const fetchMock = mockFetch([]);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<PostWritePage />);
    await userEvent.type(screen.getByPlaceholderText("제목"), " 가 ");
    await userEvent.type(screen.getByPlaceholderText("내용"), "내용입니다");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(alertSpy).toHaveBeenCalledWith("제목을 2자 이상 입력해주세요.");
    expect(screen.getByPlaceholderText("제목")).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("글쓰기 : 내용이 1자면 경고하고 API 를 호출하지 않는다", async () => {
    const fetchMock = mockFetch([]);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<PostWritePage />);
    await userEvent.type(screen.getByPlaceholderText("제목"), "제목입니다");
    await userEvent.type(screen.getByPlaceholderText("내용"), "가");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(alertSpy).toHaveBeenCalledWith("내용을 2자 이상 입력해주세요.");
    expect(screen.getByPlaceholderText("내용")).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("글 수정 : 같은 규칙이 적용된다", async () => {
    const fetchMock = mockFetch(postRoutes);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<PostEditPage />);
    const titleInput = await screen.findByPlaceholderText("제목");
    expect(titleInput).toHaveAttribute("maxLength", "100");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "가");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(alertSpy).toHaveBeenCalledWith("제목을 2자 이상 입력해주세요.");
    expect(sentMethods(fetchMock)).not.toContain("PUT");
  });
});

describe("댓글 폼 유효성 검사", () => {
  beforeEach(() => resetNavigation({ id: "1" }));

  it("댓글 작성 : 최대 길이가 걸려 있고, 1자면 경고하고 API 를 호출하지 않는다", async () => {
    const fetchMock = mockFetch(postRoutes);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<PostDetailPage />);
    await screen.findByText(/댓글 1/);
    const textarea = screen.getByPlaceholderText("댓글 내용");
    expect(textarea).toHaveAttribute("maxLength", "100");
    await userEvent.type(textarea, "가");
    await userEvent.click(screen.getByRole("button", { name: "작성" }));

    expect(alertSpy).toHaveBeenCalledWith("댓글 내용을 2자 이상 입력해주세요.");
    expect(textarea).toHaveFocus();
    expect(sentMethods(fetchMock)).not.toContain("POST");
  });
});
