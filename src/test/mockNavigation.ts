import { vi } from "vitest";

export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
};

export const navigationState = { params: {} as Record<string, string> };

/** 각 테스트 파일에서 vi.mock("next/navigation", () => navigationModule) 로 사용 */
export const navigationModule = {
  useRouter: () => routerMock,
  useParams: () => navigationState.params,
};

export function resetNavigation(params: Record<string, string> = {}) {
  Object.values(routerMock).forEach((fn) => fn.mockReset());
  navigationState.params = params;
}
