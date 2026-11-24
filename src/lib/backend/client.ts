import type { RsData } from "@/type/post";

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

/** 4xx·5xx 응답. 백엔드가 보낸 RsData 의 resultCode, msg 를 담는다. */
export class ApiError extends Error {
  readonly status: number;
  readonly resultCode: string;
  readonly msg: string;

  constructor(status: number, resultCode: string, msg: string) {
    super(`${resultCode} : ${msg}`);
    this.name = "ApiError";
    this.status = status;
    this.resultCode = resultCode;
    this.msg = msg;
  }
}

export const apiFetch = (url: string, options?: RequestInit) => {
  if (options?.body) {
    const headers = new Headers(options.headers || {});

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json; charset=utf-8");
    }

    options.headers = headers;
  }

  return fetch(`${NEXT_PUBLIC_API_BASE_URL}${url}`, options).then(
    async (res) => {
      // fetch 는 4xx·5xx 에도 reject 하지 않으므로 직접 예외로 바꾼다.
      if (!res.ok) {
        const body: Partial<RsData<unknown>> | null = await res
          .json()
          .catch(() => null);

        throw new ApiError(
          res.status,
          body?.resultCode ?? String(res.status),
          body?.msg ?? res.statusText,
        );
      }

      return res.json();
    },
  );
};

/** API 호출 실패를 사용자에게 알린다. ApiError 는 "resultCode : msg" 로 보인다. */
export const alertError = (error: unknown) => {
  alert(error instanceof Error ? error.message : String(error));
};
