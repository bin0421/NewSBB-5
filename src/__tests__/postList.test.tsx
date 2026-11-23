import Page from "@/app/posts/page";
import { mockFetch } from "@/test/mockFetch";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

const post = (id: number, title: string) => ({
  id,
  createDate: "2026-01-01T00:00:00",
  modifyDate: "2026-01-01T00:00:00",
  title,
  content: `${title} 내용`,
});

describe("글 다건조회", () => {
  it("불러오기 전에는 로딩중을 보여준다", () => {
    mockFetch([{ url: "/api/v1/posts", body: [] }]);

    render(<Page />);

    expect(screen.getByText("로딩중...")).toBeInTheDocument();
  });

  it("글 목록을 불러와 각 글을 상세 페이지 링크로 보여준다", async () => {
    mockFetch([
      { url: "/api/v1/posts", body: [post(1, "제목 1"), post(2, "제목 2")] },
    ]);

    render(<Page />);

    expect(
      await screen.findByRole("heading", { name: "글 목록" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "제목 1" })).toHaveAttribute(
      "href",
      "/posts/1",
    );
    expect(screen.getByRole("link", { name: "제목 2" })).toHaveAttribute(
      "href",
      "/posts/2",
    );
  });

  it("글이 없으면 안내 문구를 보여준다", async () => {
    mockFetch([{ url: "/api/v1/posts", body: [] }]);

    render(<Page />);

    expect(await screen.findByText("글이 없습니다.")).toBeInTheDocument();
  });

  it("글쓰기 페이지로 가는 링크가 있다", async () => {
    mockFetch([{ url: "/api/v1/posts", body: [] }]);

    render(<Page />);

    expect(await screen.findByRole("link", { name: "글쓰기" })).toHaveAttribute(
      "href",
      "/posts/write",
    );
  });
});
