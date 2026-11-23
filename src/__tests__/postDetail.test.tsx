import Page from "@/app/posts/[id]/page";
import { mockFetch } from "@/test/mockFetch";
import { resetNavigation } from "@/test/mockNavigation";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", async () => (await import("@/test/mockNavigation")).navigationModule);

const post = {
  id: 1,
  createDate: "2026-01-01T00:00:00",
  modifyDate: "2026-01-01T00:00:00",
  title: "제목 1",
  content: "첫째 줄\n둘째 줄",
};

describe("글 단건조회", () => {
  beforeEach(() => resetNavigation({ id: "1" }));

  it("불러오기 전에는 로딩중을 보여준다", () => {
    mockFetch([
      { url: "/api/v1/posts/1", body: post },
      { url: "/api/v1/posts/1/comments", body: [] },
    ]);

    render(<Page />);

    expect(screen.getByText("로딩중...")).toBeInTheDocument();
  });

  it("URL 의 id 로 글을 불러와 번호, 제목, 내용을 보여준다", async () => {
    mockFetch([
      { url: "/api/v1/posts/1", body: post },
      { url: "/api/v1/posts/1/comments", body: [] },
    ]);

    render(<Page />);

    expect(
      await screen.findByRole("heading", { name: "글 상세페이지" }),
    ).toBeInTheDocument();
    expect(screen.getByText("번호 : 1")).toBeInTheDocument();
    expect(screen.getByText("제목: 제목 1")).toBeInTheDocument();
    expect(screen.getByText(/첫째 줄\s+둘째 줄/)).toBeInTheDocument();
  });
});
