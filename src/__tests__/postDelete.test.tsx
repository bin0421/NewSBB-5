import Page from "@/app/posts/[id]/page";
import { mockFetch } from "@/test/mockFetch";
import { resetNavigation, routerMock } from "@/test/mockNavigation";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", async () => (await import("@/test/mockNavigation")).navigationModule);

const post = {
  id: 1,
  createDate: "2026-01-01T00:00:00",
  modifyDate: "2026-01-01T00:00:00",
  title: "제목 1",
  content: "내용 1",
};

const routes = [
  { url: "/api/v1/posts/1", body: post },
  { url: "/api/v1/posts/1/comments", body: [] },
  {
    method: "DELETE",
    url: "/api/v1/posts/1",
    body: { resultCode: "200-1", msg: "1번 글이 삭제되었습니다." },
  },
];

describe("글 삭제", () => {
  beforeEach(() => resetNavigation({ id: "1" }));

  it("확인하면 삭제 API 를 호출하고 메세지를 띄운 뒤 글 목록으로 replace 한다", async () => {
    const fetchMock = mockFetch(routes);
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Page />);
    await userEvent.click(await screen.findByRole("button", { name: "삭제" }));

    expect(confirmSpy).toHaveBeenCalledWith("1번 글을 정말로 삭제하시겠습니까?");
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("1번 글이 삭제되었습니다."),
    );
    expect(routerMock.replace).toHaveBeenCalledWith("/posts");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/posts/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("취소하면 삭제 API 를 호출하지 않는다", async () => {
    const fetchMock = mockFetch(routes);
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<Page />);
    await userEvent.click(await screen.findByRole("button", { name: "삭제" }));

    expect(
      fetchMock.mock.calls.some(([, init]) => init?.method === "DELETE"),
    ).toBe(false);
    expect(routerMock.replace).not.toHaveBeenCalled();
  });
});
