import Page from "@/app/posts/[id]/page";
import { comment, samplePost } from "@/test/fixtures";
import { mockFetch } from "@/test/mockFetch";
import { resetNavigation } from "@/test/mockNavigation";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", async () => (await import("@/test/mockNavigation")).navigationModule);

describe("댓글 여러 줄 표시", () => {
  beforeEach(() => resetNavigation({ id: "1" }));

  it("댓글 내용의 줄바꿈을 그대로 보여준다", async () => {
    mockFetch([
      { url: "/api/v1/posts/1", body: samplePost },
      { url: "/api/v1/posts/1/comments", body: [comment(1, "첫째 줄\n둘째 줄")] },
    ]);

    render(<Page />);

    const content = await screen.findByText(/첫째 줄\s+둘째 줄/);
    expect(content.textContent).toContain("첫째 줄\n둘째 줄");
    expect(content).toHaveStyle({ whiteSpace: "pre-line" });
  });

  it("여러 줄로 수정한 내용도 줄바꿈을 살려 보여준다", async () => {
    mockFetch([
      { url: "/api/v1/posts/1", body: samplePost },
      { url: "/api/v1/posts/1/comments", body: [comment(1, "댓글 1")] },
      {
        method: "PUT",
        url: "/api/v1/posts/1/comments/1",
        body: { resultCode: "200-1", msg: "1번 댓글이 수정되었습니다.", data: null },
      },
    ]);
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Page />);
    const [item] = await screen.findAllByRole("listitem");
    await userEvent.click(within(item).getByRole("button", { name: "수정" }));
    const textarea = within(item).getByRole("textbox");
    await userEvent.clear(textarea);
    await userEvent.type(textarea, "첫째 줄{Enter}둘째 줄");
    await userEvent.click(within(item).getByRole("button", { name: "저장" }));

    await waitFor(() => expect(alertSpy).toHaveBeenCalled());
    const content = within(item).getByText(/첫째 줄\s+둘째 줄/);
    expect(content.textContent).toContain("첫째 줄\n둘째 줄");
    expect(content).toHaveStyle({ whiteSpace: "pre-line" });
  });
});
