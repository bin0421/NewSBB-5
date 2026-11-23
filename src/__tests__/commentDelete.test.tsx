import Page from "@/app/posts/[id]/page";
import { comment, samplePost } from "@/test/fixtures";
import { mockFetch } from "@/test/mockFetch";
import { resetNavigation } from "@/test/mockNavigation";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", async () => (await import("@/test/mockNavigation")).navigationModule);

const routes = [
  { url: "/api/v1/posts/1", body: samplePost },
  {
    url: "/api/v1/posts/1/comments",
    body: [comment(1, "댓글 1"), comment(2, "댓글 2")],
  },
  {
    method: "DELETE",
    url: "/api/v1/posts/1/comments/2",
    body: { resultCode: "200-1", msg: "2번 댓글이 삭제되었습니다." },
  },
];

describe("댓글 삭제", () => {
  beforeEach(() => resetNavigation({ id: "1" }));

  it("확인하면 삭제 API 를 호출하고, 성공하면 목록에서도 바로 제거한다", async () => {
    const fetchMock = mockFetch(routes);
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Page />);
    const items = await screen.findAllByRole("listitem");
    await userEvent.click(within(items[1]).getByRole("button", { name: "삭제" }));

    expect(confirmSpy).toHaveBeenCalledWith("2번 댓글을 정말로 삭제하시겠습니까?");
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("2번 댓글이 삭제되었습니다."),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/posts/1/comments/2",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(screen.queryByText(/댓글 2/)).not.toBeInTheDocument();
    expect(screen.getByText(/댓글 1/)).toBeInTheDocument();
  });

  it("취소하면 삭제 API 를 호출하지 않고 목록도 그대로다", async () => {
    const fetchMock = mockFetch(routes);
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<Page />);
    const items = await screen.findAllByRole("listitem");
    await userEvent.click(within(items[1]).getByRole("button", { name: "삭제" }));

    expect(
      fetchMock.mock.calls.some(([, init]) => init?.method === "DELETE"),
    ).toBe(false);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });
});
