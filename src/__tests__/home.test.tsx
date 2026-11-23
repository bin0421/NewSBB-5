import Page from "@/app/page";
import SiteHeader from "@/components/SiteHeader";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("홈", () => {
  it("메인 페이지에 환영 문구가 보인다", () => {
    render(<Page />);

    expect(screen.getByText("안녕하세요.")).toBeInTheDocument();
  });

  it("헤더에 메인, 글 목록 링크가 있다", () => {
    render(<SiteHeader />);

    expect(screen.getByRole("link", { name: "메인" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "글 목록" })).toHaveAttribute(
      "href",
      "/posts",
    );
  });
});
