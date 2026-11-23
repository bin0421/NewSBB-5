import { vi } from "vitest";

export type MockRoute = {
  method?: string;
  url: string;
  body: unknown;
  status?: number;
};

const BASE_URL = "http://localhost:8080";

/**
 * 전역 fetch 를 목킹한다.
 * routes 에 등록되지 않은 요청이 오면 에러를 던져서 테스트가 실패하도록 한다.
 */
export function mockFetch(routes: MockRoute[]) {
  const fetchMock = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method ?? "GET").toUpperCase();

      const route = routes.find(
        (r) => BASE_URL + r.url === url && (r.method ?? "GET") === method,
      );

      if (!route) throw new Error(`Unmocked request: ${method} ${url}`);

      return new Response(JSON.stringify(route.body), {
        status: route.status ?? 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  );

  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}
