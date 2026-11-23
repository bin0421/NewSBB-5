import Page from "@/app/posts/[id]/page";
import { comment, samplePost } from "@/test/fixtures";
import { mockFetch } from "@/test/mockFetch";
import { resetNavigation } from "@/test/mockNavigation";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", async () => (await import("@/test/mockNavigation")).navigationModule);

const routes = [
  { url: "/api/v1/posts/1", body: samplePost },
  { url: "/api/v1/posts/1/comments", body: [comment(1, "댓글 1")] },
  {
    method: "POST",
    url: "/api/v1/posts/1/comments",
    body: {
      resultCode: "201-1",
      msg: "2번 댓글이 작성되었습니다.",
      data: comment(2, "새 댓글"),
    },
  },
];

describe("댓글 작성", () => {
  beforeEach(() => resetNavigation({ id: "1" }));

  it("내용이 비어있으면 경고하고 API 를 호출하지 않는다", async () => {
    const fetchMock = mockFetch(routes);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Page />);
    await screen.findByText(/댓글 1/);
    await userEvent.type(screen.getByPlaceholderText("댓글 내용"), "   ");
    await userEvent.click(screen.getByRole("button", { name: "작성" }));

    expect(alertSpy).toHaveBeenCalledWith("댓글 내용을 입력해주세요.");
    expect(screen.getByPlaceholderText("댓글 내용")).toHaveFocus();
    expect(
      fetchMock.mock.calls.some(([, init]) => init?.method === "POST"),
    ).toBe(false);
  });

  it("작성 API 를 호출하고, 성공하면 폼을 비우고 목록에 새 댓글을 추가한다", async () => {
    const fetchMock = mockFetch(routes);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Page />);
    expect(
      await screen.findByRole("heading", { name: "댓글 작성" }),
    ).toBeInTheDocument();
    await screen.findByText(/댓글 1/);

    const textarea = screen.getByPlaceholderText("댓글 내용");
    await userEvent.type(textarea, "  새 댓글  ");
    await userEvent.click(screen.getByRole("button", { name: "작성" }));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("2번 댓글이 작성되었습니다."),
    );

    const postCall = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "POST",
    )!;
    expect(postCall[0]).toBe("http://localhost:8080/api/v1/posts/1/comments");
    expect(JSON.parse(postCall[1]?.body as string)).toEqual({
      content: "새 댓글",
    });

    expect(textarea).toHaveValue("");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText(/2 : 새 댓글/)).toBeInTheDocument();
  });
});
