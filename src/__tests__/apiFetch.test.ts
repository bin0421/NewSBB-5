import { apiFetch } from "@/lib/backend/client";
import { mockFetch } from "@/test/mockFetch";
import { describe, expect, it } from "vitest";

describe("apiFetch", () => {
  it("NEXT_PUBLIC_API_BASE_URL 을 앞에 붙여 요청하고 JSON 을 반환한다", async () => {
    const fetchMock = mockFetch([{ url: "/api/v1/posts", body: [{ id: 1 }] }]);

    const data = await apiFetch("/api/v1/posts");

    expect(data).toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:8080/api/v1/posts",
      undefined,
    );
  });

  it("body 가 있으면 Content-Type 을 application/json 으로 설정한다", async () => {
    const fetchMock = mockFetch([
      { method: "POST", url: "/api/v1/posts", body: { resultCode: "201-1" } },
    ]);

    await apiFetch("/api/v1/posts", {
      method: "POST",
      body: JSON.stringify({ title: "제목" }),
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get("Content-Type")).toBe(
      "application/json; charset=utf-8",
    );
  });

  it("이미 지정된 Content-Type 은 덮어쓰지 않는다", async () => {
    const fetchMock = mockFetch([
      { method: "POST", url: "/api/v1/posts", body: {} },
    ]);

    await apiFetch("/api/v1/posts", {
      method: "POST",
      body: "a=1",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get("Content-Type")).toBe(
      "application/x-www-form-urlencoded",
    );
  });
});
