import Page from "@/app/posts/[id]/page";
import { comment, samplePost } from "@/test/fixtures";
import { mockFetch } from "@/test/mockFetch";
import { resetNavigation } from "@/test/mockNavigation";
import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", async () => (await import("@/test/mockNavigation")).navigationModule);

describe("댓글 다건조회", () => {
  beforeEach(() => resetNavigation({ id: "1" }));

  it("글 상세페이지에서 댓글 목록을 번호와 함께 보여준다", async () => {
    mockFetch([
      { url: "/api/v1/posts/1", body: samplePost },
      {
        url: "/api/v1/posts/1/comments",
        body: [comment(1, "댓글 1"), comment(2, "댓글 2")],
      },
    ]);

    render(<Page />);

    expect(
      await screen.findByRole("heading", { name: "댓글 목록" }),
    ).toBeInTheDocument();
    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText(/1 : 댓글 1/)).toBeInTheDocument();
    expect(within(items[1]).getByText(/2 : 댓글 2/)).toBeInTheDocument();
  });

  it("댓글이 없으면 안내 문구를 보여준다", async () => {
    mockFetch([
      { url: "/api/v1/posts/1", body: samplePost },
      { url: "/api/v1/posts/1/comments", body: [] },
    ]);

    render(<Page />);

    expect(await screen.findByText("댓글이 없습니다.")).toBeInTheDocument();
  });

  it("댓글을 아직 못 불러왔으면 댓글 로딩중을 보여준다", async () => {
    mockFetch([
      { url: "/api/v1/posts/1", body: samplePost },
      { url: "/api/v1/posts/1/comments", body: [] },
    ]);
    // 댓글 요청만 끝나지 않도록 한다
    const realFetch = globalThis.fetch;
    vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) =>
      String(input).endsWith("/comments")
        ? new Promise(() => {})
        : realFetch(input, init),
    );

    render(<Page />);

    expect(await screen.findByText("댓글 로딩중...")).toBeInTheDocument();
  });
});
