import DetailPage from "@/app/posts/[id]/page";
import Page from "@/app/posts/[id]/edit/page";
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
  title: "기존 제목",
  content: "기존 내용",
};

const routes = [
  { url: "/api/v1/posts/1", body: post },
  { url: "/api/v1/posts/1/comments", body: [] },
  {
    method: "PUT",
    url: "/api/v1/posts/1",
    body: { resultCode: "200-1", msg: "1번 글이 수정되었습니다." },
  },
];

describe("글 수정", () => {
  beforeEach(() => resetNavigation({ id: "1" }));

  it("상세페이지에 수정 페이지 링크가 있다", async () => {
    mockFetch(routes);

    render(<DetailPage />);

    expect(await screen.findByRole("link", { name: "수정" })).toHaveAttribute(
      "href",
      "/posts/1/edit",
    );
  });

  it("수정 폼에 기존 제목과 내용이 채워져 있다", async () => {
    mockFetch(routes);

    render(<Page />);

    expect(
      await screen.findByRole("heading", { name: "1번 글 수정" }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("제목")).toHaveValue("기존 제목");
    expect(screen.getByPlaceholderText("내용")).toHaveValue("기존 내용");
  });

  it("제목을 비우면 경고하고 API 를 호출하지 않는다", async () => {
    const fetchMock = mockFetch(routes);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Page />);
    await userEvent.clear(await screen.findByPlaceholderText("제목"));
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(alertSpy).toHaveBeenCalledWith("제목을 입력해주세요.");
    expect(
      fetchMock.mock.calls.some(([, init]) => init?.method === "PUT"),
    ).toBe(false);
  });

  it("수정 API 를 호출하고 메세지를 띄운 뒤 상세페이지로 replace 한다", async () => {
    const fetchMock = mockFetch(routes);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Page />);
    const titleInput = await screen.findByPlaceholderText("제목");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "새 제목");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("1번 글이 수정되었습니다."),
    );
    expect(routerMock.replace).toHaveBeenCalledWith("/posts/1");

    const putCall = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "PUT",
    )!;
    expect(putCall[0]).toBe("http://localhost:8080/api/v1/posts/1");
    expect(JSON.parse(putCall[1]?.body as string)).toEqual({
      title: "새 제목",
      content: "기존 내용",
    });
  });
});
