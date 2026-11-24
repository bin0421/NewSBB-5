import Page from "@/app/posts/[id]/page";
import { comment, samplePost } from "@/test/fixtures";
import { mockFetch, type MockRoute } from "@/test/mockFetch";
import { resetNavigation } from "@/test/mockNavigation";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", async () => (await import("@/test/mockNavigation")).navigationModule);

const baseRoutes: MockRoute[] = [
  { url: "/api/v1/posts/1", body: samplePost },
  {
    url: "/api/v1/posts/1/comments",
    body: [comment(1, "댓글 1"), comment(2, "댓글 2")],
  },
];

const modifyRoute: MockRoute = {
  method: "PUT",
  url: "/api/v1/posts/1/comments/1",
  body: { resultCode: "200-1", msg: "1번 댓글이 수정되었습니다.", data: null },
};

const sentMethods = (fetchMock: ReturnType<typeof mockFetch>) =>
  fetchMock.mock.calls.map(([, init]) => init?.method ?? "GET");

/** 첫 번째 댓글 항목을 찾아 수정 모드로 바꾼다. */
const openModifyForm = async () => {
  const [item] = await screen.findAllByRole("listitem");
  await userEvent.click(within(item).getByRole("button", { name: "수정" }));

  return item;
};

describe("댓글 수정", () => {
  beforeEach(() => resetNavigation({ id: "1" }));

  it("수정을 누르면 그 댓글만 기존 내용이 채워진 수정 폼으로 바뀌고, 수정취소로 되돌아간다", async () => {
    const fetchMock = mockFetch(baseRoutes);

    render(<Page />);
    const item = await openModifyForm();

    const textarea = within(item).getByRole("textbox");
    expect(textarea).toHaveValue("댓글 1");
    expect(textarea).toHaveFocus();
    expect(textarea).toHaveAttribute("maxLength", "100");
    expect(within(item).getByRole("button", { name: "저장" })).toBeInTheDocument();

    const [, otherItem] = screen.getAllByRole("listitem");
    expect(within(otherItem).queryByRole("textbox")).not.toBeInTheDocument();

    await userEvent.click(within(item).getByRole("button", { name: "수정취소" }));

    expect(within(item).queryByRole("textbox")).not.toBeInTheDocument();
    expect(within(item).getByText(/댓글 1/)).toBeInTheDocument();
    expect(sentMethods(fetchMock)).not.toContain("PUT");
  });

  it("저장하면 수정 API 를 호출하고, 성공하면 알린 뒤 바뀐 내용을 보여준다", async () => {
    const fetchMock = mockFetch([...baseRoutes, modifyRoute]);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Page />);
    const item = await openModifyForm();
    const textarea = within(item).getByRole("textbox");
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "  고친 댓글  ");
    await userEvent.click(within(item).getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("1번 댓글이 수정되었습니다."),
    );

    const putCall = fetchMock.mock.calls.find(([, init]) => init?.method === "PUT")!;
    expect(putCall[0]).toBe("http://localhost:8080/api/v1/posts/1/comments/1");
    expect(JSON.parse(putCall[1]?.body as string)).toEqual({ content: "고친 댓글" });

    expect(within(item).queryByRole("textbox")).not.toBeInTheDocument();
    expect(within(item).getByText(/1 : 고친 댓글/)).toBeInTheDocument();
    expect(screen.getByText(/2 : 댓글 2/)).toBeInTheDocument();
  });

  it("내용이 1자면 경고하고 API 를 호출하지 않는다", async () => {
    const fetchMock = mockFetch([...baseRoutes, modifyRoute]);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Page />);
    const item = await openModifyForm();
    const textarea = within(item).getByRole("textbox");
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "가");
    await userEvent.click(within(item).getByRole("button", { name: "저장" }));

    expect(alertSpy).toHaveBeenCalledWith("댓글 내용을 2자 이상 입력해주세요.");
    expect(textarea).toHaveFocus();
    expect(sentMethods(fetchMock)).not.toContain("PUT");
  });

  it("수정에 실패하면 알리고 수정 폼과 기존 내용을 그대로 둔다", async () => {
    mockFetch([
      ...baseRoutes,
      {
        ...modifyRoute,
        status: 400,
        body: { resultCode: "400-1", msg: "요청 본문이 올바르지 않습니다.", data: null },
      },
    ]);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Page />);
    const item = await openModifyForm();
    const textarea = within(item).getByRole("textbox");
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "고친 댓글");
    await userEvent.click(within(item).getByRole("button", { name: "저장" }));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith("400-1 : 요청 본문이 올바르지 않습니다."),
    );
    expect(within(item).getByRole("textbox")).toHaveValue("고친 댓글");

    await userEvent.click(within(item).getByRole("button", { name: "수정취소" }));
    expect(within(item).getByText(/1 : 댓글 1/)).toBeInTheDocument();
  });
});
