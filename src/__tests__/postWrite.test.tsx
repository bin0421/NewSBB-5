import Page from "@/app/posts/write/page";
import { mockFetch } from "@/test/mockFetch";
import { resetNavigation, routerMock } from "@/test/mockNavigation";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", async () => (await import("@/test/mockNavigation")).navigationModule);

const writeRoute = {
  method: "POST",
  url: "/api/v1/posts",
  body: {
    resultCode: "201-1",
    msg: "3번 글이 작성되었습니다.",
    data: {
      id: 3,
      createDate: "2026-01-01T00:00:00",
      modifyDate: "2026-01-01T00:00:00",
      title: "새 제목",
      content: "새 내용",
    },
  },
};

describe("글 작성", () => {
  beforeEach(() => resetNavigation());

  it("제목이 비어있으면 경고하고 API 를 호출하지 않는다", async () => {
    const fetchMock = mockFetch([writeRoute]);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Page />);
    await userEvent.type(screen.getByPlaceholderText("제목"), "   ");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(alertSpy).toHaveBeenCalledWith("제목을 입력해주세요.");
    expect(screen.getByPlaceholderText("제목")).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("내용이 비어있으면 경고하고 API 를 호출하지 않는다", async () => {
    const fetchMock = mockFetch([writeRoute]);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Page />);
    await userEvent.type(screen.getByPlaceholderText("제목"), "새 제목");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    expect(alertSpy).toHaveBeenCalledWith("내용을 입력해주세요.");
    expect(screen.getByPlaceholderText("내용")).toHaveFocus();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("작성 API 를 호출하고 메세지를 띄운 뒤 새 글 상세로 replace 한다", async () => {
    const fetchMock = mockFetch([writeRoute]);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Page />);
    expect(screen.getByRole("heading", { name: "글쓰기" })).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText("제목"), "  새 제목  ");
    await userEvent.type(screen.getByPlaceholderText("내용"), "새 내용");
    await userEvent.click(screen.getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("3번 글이 작성되었습니다."),
    );
    expect(routerMock.replace).toHaveBeenCalledWith("/posts/3");

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:8080/api/v1/posts");
    expect(init?.method).toBe("POST");
    expect(JSON.parse(init?.body as string)).toEqual({
      title: "새 제목",
      content: "새 내용",
    });
  });
});
