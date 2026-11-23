# NewSBB-5

스프링부트 글·댓글 REST API 에 붙는 프론트엔드를 Next.js·TypeScript 로, 기능마다 테스트를 먼저 쓰는 TDD 로 작은 단계마다 커밋하며 만드는 저장소.

- 참고 : [강의 설명 1\~34강](https://www.slog.gg/p/14175), 강사 저장소 [jhs512/p-14175-3](https://github.com/jhs512/p-14175-3) (034-2 커밋까지)
- 백엔드 : [jhs512/p-14172-2](https://github.com/jhs512/p-14172-2) (`http://localhost:8080`)
- 진행 방식 : 요구한 9개 기능(홈, 글 다건조회·단건조회·삭제·작성·수정, 댓글 다건조회·삭제·작성)을 이 순서로 구현한다. 기능마다 테스트를 먼저 커밋(실패)하고 구현을 커밋(통과)한다.
- 단계 번호 : 세 자리 번호 001, 002 ... / 한 단계 안의 커밋은 하위 번호 `-1` 테스트 추가, `-2` 구현, 필요할 때만 `-3` 리팩터링
  - 제목 끝의 `(실패)` 는 테스트가 실패하는 상태로 커밋했다는 뜻이다.
- 진행 기록·결정 사항 : [NewSBB-5.txt](NewSBB-5.txt)

## 개발 환경

| 항목 | 버전 |
|---|---|
| Node.js / npm | 24.22.1 / 11.19.1 |
| Next.js | 16.4.6 (App Router, Turbopack) |
| React | 19.3.0 |
| TypeScript | 5.9.3 |
| Tailwind CSS | 4.3.3 |
| 테스트 | Vitest 5.1.1, React Testing Library 16.3.3, jsdom |
| 백엔드 | jhs512/p-14172-2 (Spring Boot, Java 25) |

## 실행 방법

1. 백엔드 저장소를 받아 실행한다. (`http://localhost:8080`)
2. 이 저장소에서 `npm install` 후 `npm run dev` 로 실행하고 `http://localhost:3000` 에 접속한다.
   - 백엔드의 CORS 설정이 `http://localhost:3000` 만 허용하므로 3000 번 포트로 실행해야 한다.
3. 테스트 : `npm test` / 타입 검사 : `npm run typecheck` / 린트 : `npm run lint`

| 주소 | 화면 |
|---|---|
| `/` | 메인 |
| `/posts` | 글 목록 |
| `/posts/write` | 글쓰기 |
| `/posts/{id}` | 글 상세, 댓글 목록·작성·삭제 |
| `/posts/{id}/edit` | 글 수정 |

## 개발 일지

각 단계는 다음 형식으로 적는다.

- **링크** : 단어 "링크"를 누르면 해당 커밋 페이지로 이동해 직전 단계와의 코드 변경(diff)을 볼 수 있다
- **원인** : 이 단계가 필요한 이유 (발견한 문제나 개선점)
- **작업** : 추가·수정·삭제한 기능, 컴포넌트, 함수, 파일
- **설명** : 작업의 구현 방식과 동작 원리 (작업에 적은 내용은 반복하지 않는다)

### 001 프로젝트 생성

- **[링크](https://github.com/bin0421/NewSBB-5/commit/b9c57f7d4f8f898a59db2e6cdf02b6301acdf272)**
- **원인** : 아무것도 없는 저장소에서 시작하므로 실행할 수 있는 Next.js 프로젝트와, 기능마다 테스트를 먼저 쓰기 위한 테스트 환경이 필요하다.
- **작업**
  - 추가 : `create-next-app` 템플릿 — TypeScript, App Router, `src/` 폴더, Tailwind CSS, ESLint, Turbopack, 경로 별칭 `@/*`
  - 추가 : 테스트 도구 `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`·`dom`·`user-event`·`jest-dom`, `vite-tsconfig-paths`
  - 추가 : `vitest.config.mts`, `src/test/setup.ts`, 스크립트 `test`(`vitest run`)·`test:watch`(`vitest`)·`typecheck`(`next typegen && tsc --noEmit`)
  - 추가 : `.env` — `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`
  - 추가 : `.gitattributes`, `README.md`, `NewSBB-5.txt`
- **설명**
  - 폴더 이름 `NewSBB-5` 는 대문자가 있어 npm 패키지 이름으로 쓸 수 없으므로 패키지 이름은 `newsbb-5` 로 했다.
  - `@types/node` 를 템플릿의 20 에서 24 로 올렸다. vitest 5 가 `@types/node` 22 이상을 요구해 그대로는 설치가 실패한다.
  - 테스트 환경은 Next.js 문서(`node_modules/next/dist/docs` 의 Vitest 안내)를 따른다. 컴포넌트는 `jsdom` 에서 그리고, `vite-tsconfig-paths` 로 테스트에서도 `@/` 별칭을 쓴다. `setup.ts` 는 `jest-dom` 검사 함수(`toBeInTheDocument` 등)를 등록하고, 매 테스트 뒤 화면 정리(`cleanup`)와 가짜 함수 복구를 한다.
  - 테스트에서도 API 주소가 같도록 `vitest.config.mts` 의 `test.env` 에 `NEXT_PUBLIC_API_BASE_URL` 을 넣었다.
  - 브라우저에서 읽는 환경 변수는 이름이 `NEXT_PUBLIC_` 으로 시작해야 한다 (20강). 비밀 값이 아니므로 `.env` 를 버전 관리에 넣는다 (`.gitignore` 에 `!.env`).
  - `.gitattributes` 로 텍스트 파일의 줄바꿈을 LF 로 고정해 Windows 에서도 섞이지 않게 한다.
  - 결과 : 아직 테스트 파일은 없다. `npm run build` 통과.

### 002-1 홈 테스트 추가 (실패)

- **[링크](https://github.com/bin0421/NewSBB-5/commit/a92032949c8f1e1c7abe41f0d698462d6ffa9843)**
- **원인** : 첫 화면과, 모든 페이지 위에 보일 메뉴가 필요하다. 먼저 보여야 할 내용을 테스트로 정한다.
- **작업**
  - 추가 : 테스트 `home.test.tsx` — 메인 페이지에 `안녕하세요.` 가 보이는지, 헤더에 `메인`(`/`)·`글 목록`(`/posts`) 링크가 있는지 확인
- **설명**
  - 헤더를 `layout.tsx` 안에 두면 `<html>`·`<body>` 까지 함께 그려야 해서 테스트하기 어렵다. 그래서 `SiteHeader` 컴포넌트로 떼어 테스트한다.
  - 실패 확인 : `SiteHeader` 가 없어 `Failed to resolve import "@/components/SiteHeader"` 로 실패한다.

### 002-2 홈

- **[링크](https://github.com/bin0421/NewSBB-5/commit/39cb5c42244a0488392dcfe4efa6212bd07cd1a0)**
- **원인** : 002-1 테스트가 실패한다. 헤더 컴포넌트가 없고 메인 페이지는 템플릿 소개 화면 그대로다.
- **작업**
  - 추가 : `SiteHeader` — `메인`, `글 목록` 링크
  - 수정 : 메인 페이지 `src/app/page.tsx`
    - 이전 : 템플릿 소개 화면
    - 이후 : 화면 가운데 `안녕하세요.`
  - 수정 : `src/app/layout.tsx`
    - 이전 : `lang="en"`, 제목 `Create Next App`, `<body>` 에 페이지만
    - 이후 : `lang="ko"`, 제목 `사이트 A`, `<body>` 에 `SiteHeader` + `<main>`(페이지) + 푸터
- **설명**
  - `next/link` 의 `Link` 는 `<a>` 와 달리 페이지 전체를 다시 불러오지 않고 바뀐 부분만 다시 그린다 (7강).
  - `<body>` 를 `flex flex-col min-h-screen`, `<main>` 을 `flex-grow` 로 두어 내용이 짧아도 푸터가 화면 맨 아래에 붙는다.
  - 결과 : 테스트 2개 통과.

### 003-1 글 다건조회 테스트 추가 (실패)

- **[링크](https://github.com/bin0421/NewSBB-5/commit/214ae140e0fc400adec49666794ed4915b8f6394)**
- **원인** : `GET /api/v1/posts` 로 글 목록을 불러와 보여줘야 한다. API 호출 함수와 목록 화면을 먼저 테스트로 정한다.
- **작업**
  - 추가 : 테스트 도우미 `mockFetch(routes)` — 전역 `fetch` 를 가짜로 바꿔 주소·메서드별로 정해 둔 JSON 을 돌려준다
  - 추가 : 테스트 `apiFetch.test.ts` — 주소 앞에 `NEXT_PUBLIC_API_BASE_URL` 을 붙이고 JSON 을 돌려주는지, 본문이 있으면 `Content-Type: application/json; charset=utf-8` 을 넣는지, 이미 정한 `Content-Type` 은 그대로 두는지 확인
  - 추가 : 테스트 `postList.test.tsx` — 처음에는 `로딩중...`, 불러오면 `글 목록` 제목과 글마다 `/posts/{id}` 링크, 글이 없으면 `글이 없습니다.`, `/posts/write` 로 가는 `글쓰기` 링크 확인
- **설명**
  - 실제 백엔드 없이 테스트하려고 `fetch` 를 바꾼다. 등록하지 않은 요청이 오면 에러를 던져 예상하지 못한 호출을 바로 알 수 있다.
  - 실패 확인 : `@/lib/backend/client` 와 `@/app/posts/page` 가 없어 두 테스트 파일 모두 import 에서 실패한다.

### 003-2 글 다건조회

- **[링크](https://github.com/bin0421/NewSBB-5/commit/ad7f9b0164c5b6c9caf7f506300fd078ac4fffc9)**
- **원인** : 003-1 테스트가 실패한다. API 호출 함수, 응답 타입, 글 목록 페이지가 없다.
- **작업**
  - 추가 : `apiFetch(url, options)` (`src/lib/backend/client.ts`)
  - 추가 : 타입 `PostDto`, `PostWithContentDto`, `PostCommentDto` (`src/type/post.ts`)
  - 추가 : 글 목록 페이지 `/posts` (`src/app/posts/page.tsx`)
- **설명**
  - `apiFetch` 는 강의 21·24·27강의 방식이다. 주소 앞부분과 `res.json()` 반복을 없애고, 본문이 있을 때만 `Headers` 객체로 `Content-Type` 을 넣는다. `Headers` 는 헤더 이름의 대소문자를 가리지 않으므로 이미 넣은 값을 정확히 찾는다.
  - 타입 필드는 백엔드 `PostDto`·`PostCommentDto` 와 같다. 목록에는 내용이 필요 없으므로 `PostDto` 에는 `content` 를 두지 않고, 상세용 `PostWithContentDto` 는 `&` 로 `content` 를 더한다 (19강).
  - 페이지는 `"use client"` 클라이언트 컴포넌트다. `useEffect` 에서 불러와 `useState` 에 넣는다. 상태 초기값을 빈 배열이 아닌 `null` 로 두어 로딩중과 글 없음을 구분한다 (31강).
  - 결과 : 테스트 9개 통과.

### 004-1 글 단건조회 테스트 추가 (실패)

- **[링크](LINK:004-1)**
- **원인** : 목록의 글을 누르면 `GET /api/v1/posts/{id}` 로 한 건을 불러와 보여줘야 한다.
- **작업**
  - 추가 : 테스트 도우미 `mockNavigation.ts` — `next/navigation` 의 `useRouter`·`useParams` 를 가짜로 바꾸고, `router.replace` 등의 호출을 기록
  - 추가 : 테스트 `postDetail.test.tsx` — 처음에는 `로딩중...`, 주소의 `id` 로 불러와 `글 상세페이지` 제목, `번호 : 1`, `제목: 제목 1`, 줄바꿈이 있는 내용이 보이는지 확인
- **설명**
  - 테스트에는 Next.js 라우터가 없으므로 주소 파라미터와 페이지 이동을 가짜로 바꾼다. 테스트 파일마다 `vi.mock("next/navigation", ...)` 으로 이 도우미를 연결한다.
  - 실패 확인 : `@/app/posts/[id]/page` 가 없어 import 에서 실패한다.
