# NewSBB-5

스프링부트 글·댓글 REST API 에 붙는 프론트엔드를 Next.js·TypeScript 로, 기능마다 테스트를 먼저 쓰는 TDD 로 작은 단계마다 커밋하며 만드는 저장소.

- 참고 : [강의 설명 1\~51강](https://www.slog.gg/p/14175), 강사 저장소 [jhs512/p-14175-3](https://github.com/jhs512/p-14175-3) (051 커밋까지)
- 백엔드 : [jhs512/p-14172-2](https://github.com/jhs512/p-14172-2) (`http://localhost:8080`)
- 진행 방식
  - 001\~010 (1\~34강) : 요구한 9개 기능(홈, 글 다건조회·단건조회·삭제·작성·수정, 댓글 다건조회·삭제·작성)을 이 순서로 구현한다. 기능마다 테스트를 먼저 커밋(실패)하고 구현을 커밋(통과)한다.
  - 011\~017 (35\~51강) : 리팩터링과 댓글 수정. 강의의 개선점을 반영하되 코드는 이 저장소 구조에 맞게 직접 설계한다. 리팩터링 단계는 테스트를 바꾸지 않고 기존 테스트가 그대로 통과하게 한다.
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

- **[링크](https://github.com/bin0421/NewSBB-5/commit/d1178b586388967dfc4cefb5faa8198f984c4310)**
- **원인** : 목록의 글을 누르면 `GET /api/v1/posts/{id}` 로 한 건을 불러와 보여줘야 한다.
- **작업**
  - 추가 : 테스트 도우미 `mockNavigation.ts` — `next/navigation` 의 `useRouter`·`useParams` 를 가짜로 바꾸고, `router.replace` 등의 호출을 기록
  - 추가 : 테스트 `postDetail.test.tsx` — 처음에는 `로딩중...`, 주소의 `id` 로 불러와 `글 상세페이지` 제목, `번호 : 1`, `제목: 제목 1`, 줄바꿈이 있는 내용이 보이는지 확인
- **설명**
  - 테스트에는 Next.js 라우터가 없으므로 주소 파라미터와 페이지 이동을 가짜로 바꾼다. 테스트 파일마다 `vi.mock("next/navigation", ...)` 으로 이 도우미를 연결한다.
  - 실패 확인 : `@/app/posts/[id]/page` 가 없어 import 에서 실패한다.

### 004-2 글 단건조회

- **[링크](https://github.com/bin0421/NewSBB-5/commit/19d32281b16ecba79e4ab3d44a25ecdd96ecd3ae)**
- **원인** : 004-1 테스트가 실패한다. 상세 페이지가 없다.
- **작업**
  - 추가 : 글 상세 페이지 `/posts/[id]` (`src/app/posts/[id]/page.tsx`)
  - 추가 : `src/app/posts/[id]/loading.tsx` — `로딩중...`
- **설명**
  - `useParams()` 로 주소의 `id` 를 문자열로 받아 `Number()` 로 바꾼다.
  - `post == null` 이면 먼저 `로딩중...` 을 돌려주는 가드 클로즈(early return)로 중첩을 줄인다 (18강).
  - 내용은 `white-space: pre-line` 으로 줄바꿈을 살려 보여준다.
  - `loading.tsx` 는 16강처럼 이 경로의 페이지를 준비하는 동안 보여줄 화면이다. 하위 경로인 수정 페이지(007)도 함께 감싼다.
  - 결과 : 테스트 11개 통과.

### 005-1 글 삭제 테스트 추가 (실패)

- **[링크](https://github.com/bin0421/NewSBB-5/commit/794f71f340e4587c69b5515654cc2e6dc5951b82)**
- **원인** : 상세 페이지에서 글을 지울 수 있어야 한다.
- **작업**
  - 추가 : 테스트 `postDelete.test.tsx` — `삭제` 를 누르면 `1번 글을 정말로 삭제하시겠습니까?` 확인창, 확인하면 `DELETE /api/v1/posts/1` 호출, 응답 메세지 `alert`, `/posts` 로 `router.replace` / 취소하면 호출도 이동도 없는지 확인
- **설명**
  - `window.confirm`·`window.alert` 는 `vi.spyOn` 으로 바꿔 반환값을 정하고 호출 내용을 확인한다.
  - 실패 확인 : 삭제 버튼이 없어 `Unable to find role="button" and name "삭제"` 로 2개 테스트가 실패한다.

### 005-2 글 삭제

- **[링크](https://github.com/bin0421/NewSBB-5/commit/b7f8820e49114bfb891cc252513e8aebedd248bb)**
- **원인** : 005-1 테스트가 실패한다. 상세 페이지에 삭제 기능이 없다.
- **작업**
  - 수정 : 글 상세 페이지 — `삭제` 버튼, `deletePost(id)` 추가
- **설명**
  - `confirm(...) && deletePost(id)` 로 확인을 눌렀을 때만 삭제 요청을 보낸다 (26강).
  - 이동은 `router.push` 대신 `router.replace` 를 쓴다. 방문 기록에 지운 글이 남지 않아, 목록에서 뒤로 가기를 눌러도 지운 글 페이지로 돌아가지 않는다 (25강).
  - 결과 : 테스트 13개 통과.

### 006-1 글 작성 테스트 추가 (실패)

- **[링크](https://github.com/bin0421/NewSBB-5/commit/ca23eef5bf955b629658e2c199ab994f952251bc)**
- **원인** : 새 글을 쓸 페이지가 필요하다.
- **작업**
  - 추가 : 테스트 `postWrite.test.tsx` — 제목이 공백뿐이면 `제목을 입력해주세요.` 경고와 제목 칸 포커스, 내용이 비면 `내용을 입력해주세요.` 경고와 내용 칸 포커스, 올바르면 앞뒤 공백을 뺀 `{title, content}` 로 `POST /api/v1/posts`, 응답 메세지 `alert`, 새 글 `/posts/3` 으로 `router.replace` 확인
- **설명**
  - `user-event` 로 사람이 입력하듯 글자를 치고 버튼을 누른다.
  - 실패 확인 : `@/app/posts/write/page` 가 없어 import 에서 실패한다.

### 006-2 글 작성

- **[링크](https://github.com/bin0421/NewSBB-5/commit/cd93c7bad182040252cde311985f6386ad50be36)**
- **원인** : 006-1 테스트가 실패한다. 글쓰기 페이지가 없다.
- **작업**
  - 추가 : 글쓰기 페이지 `/posts/write` (`src/app/posts/write/page.tsx`)
  - 추가 : 타입 `RsData<T>` — `resultCode`, `msg`, `data`
- **설명**
  - 폼 전송 때 `form.elements.namedItem("title")` 로 입력 칸을 찾아 값을 읽는다. `useState` 없이 입력 칸의 값을 그대로 쓰는 방식이다 (22강).
  - 값을 `trim()` 해서 입력 칸에 다시 넣은 뒤 검사하므로, 서버로는 앞뒤 공백이 없는 값이 간다.
  - 백엔드는 작성 결과를 `RsData` 로 감싸 준다. 새 글 번호는 `data.data.id` 다 (23·25강).
  - 결과 : 테스트 16개 통과.

### 007-1 글 수정 테스트 추가 (실패)

- **[링크](https://github.com/bin0421/NewSBB-5/commit/e51a2bb611519aa1931b108571a5d6141f036eec)**
- **원인** : 쓴 글을 고칠 수 있어야 한다.
- **작업**
  - 추가 : 테스트 `postEdit.test.tsx` — 상세 페이지에 `/posts/1/edit` 로 가는 `수정` 링크, 수정 페이지 제목 `1번 글 수정`, 폼에 기존 제목·내용이 채워져 있는지, 제목을 비우면 경고하고 `PUT` 을 보내지 않는지, 저장하면 `PUT /api/v1/posts/1` 에 `{title, content}`, 응답 메세지 `alert`, `/posts/1` 로 `router.replace` 확인
- **설명**
  - 실패 확인 : `@/app/posts/[id]/edit/page` 가 없어 import 에서 실패한다. 같은 파일의 수정 링크 테스트도 함께 실행되지 못한다.

### 007-2 글 수정

- **[링크](https://github.com/bin0421/NewSBB-5/commit/8828e5c351af70be1a08a37f6485980485ca5317)**
- **원인** : 007-1 테스트가 실패한다. 수정 페이지와 수정 링크가 없다.
- **작업**
  - 추가 : 글 수정 페이지 `/posts/[id]/edit` (`src/app/posts/[id]/edit/page.tsx`)
  - 수정 : 글 상세 페이지 — `삭제` 버튼 옆에 `수정` 링크
- **설명**
  - 글을 불러온 뒤에 폼을 그리고 `defaultValue` 로 기존 제목·내용을 채운다. 불러오기 전에는 폼을 그리지 않으므로 빈 기본값으로 먼저 그려지는 일이 없다 (28강).
  - 유효성 검사와 전송 방식은 글쓰기와 같고, 메서드만 `PUT` 이다 (29강).
  - 결과 : 테스트 20개 통과.

### 007-3 글 작성·수정 폼 공통 컴포넌트로 분리

- **[링크](https://github.com/bin0421/NewSBB-5/commit/a2d9bdfe70ea02f3f4473dd85192dce71ef5544c)**
- **원인** : 글쓰기 페이지와 수정 페이지에 같은 폼과 유효성 검사 코드가 두 벌 있다. 검사 규칙을 바꾸면 두 곳을 함께 고쳐야 한다.
- **작업**
  - 추가 : `PostForm({ defaultValues, onSubmit })` — 제목·내용 칸, 앞뒤 공백 제거, 빈 값 경고, 통과하면 `onSubmit({ title, content })` 호출
  - 수정 : 글쓰기 페이지
    - 이전 : 폼과 유효성 검사를 직접 가짐
    - 이후 : `<PostForm onSubmit={writePost} />`
  - 수정 : 글 수정 페이지
    - 이전 : 폼과 유효성 검사를 직접 가짐
    - 이후 : `<PostForm defaultValues={post} onSubmit={modifyPost} />`
- **설명**
  - 테스트는 바꾸지 않았다. 006·007 테스트가 화면 동작이 그대로인지 확인한다. 페이지에는 API 호출과 이동만 남는다.
  - 공통 폼에 수정 페이지의 `autoFocus` 가 들어가므로, 글쓰기 페이지도 열리면 제목 칸에 커서가 간다.
  - 강의에는 없는 리팩터링이다.
  - 결과 : 테스트 20개 통과.

### 008-1 댓글 다건조회 테스트 추가 (실패)

- **[링크](https://github.com/bin0421/NewSBB-5/commit/9441a8bbfddf199bb3e1172b3cfc5dd696a36426)**
- **원인** : 상세 페이지에서 그 글의 댓글을 `GET /api/v1/posts/{id}/comments` 로 불러와 보여줘야 한다.
- **작업**
  - 추가 : 테스트 데이터 `fixtures.ts` — `samplePost`, `comment(id, content)`
  - 추가 : 테스트 `commentList.test.tsx` — `댓글 목록` 제목, 댓글마다 `번호 : 내용`, 댓글이 없으면 `댓글이 없습니다.`, 댓글 요청이 끝나기 전에는 `댓글 로딩중...` 확인
- **설명**
  - 로딩중 테스트는 댓글 요청만 끝나지 않는 `Promise` 로 바꿔, 글은 보이고 댓글은 아직 오지 않은 상태를 만든다.
  - 실패 확인 : 댓글 영역이 없어 `Unable to find role="heading" and name "댓글 목록"` 등으로 3개 테스트가 실패한다.

### 008-2 댓글 다건조회

- **[링크](https://github.com/bin0421/NewSBB-5/commit/629f550b5fda5ee5b69dffe6b8c983dfed3b0c26)**
- **원인** : 008-1 테스트가 실패한다. 상세 페이지에 댓글 영역이 없다.
- **작업**
  - 추가 : `PostCommentSection({ postId })` — 댓글 목록 (`src/components/PostCommentSection.tsx`)
  - 수정 : 글 상세 페이지 — 수정·삭제 버튼 아래에 구분선과 `PostCommentSection`
- **설명**
  - 강의는 상세 페이지 한 곳에 글과 댓글 상태를 모두 두지만, 댓글 목록·삭제·작성은 댓글 상태만 다루므로 컴포넌트로 뗐다.
  - 댓글 상태도 초기값을 `null` 로 두어 `댓글 로딩중...` 과 `댓글이 없습니다.` 를 구분한다 (30·31강).
  - 이 컴포넌트는 글을 불러온 뒤에 그려지므로 댓글 요청은 글 요청이 끝난 다음에 시작한다. 강의는 두 요청을 동시에 보낸다.
  - 결과 : 테스트 23개 통과.

### 009-1 댓글 삭제 테스트 추가 (실패)

- **[링크](https://github.com/bin0421/NewSBB-5/commit/9ada1b727a95b2a298efc2938146abe746521e62)**
- **원인** : 댓글을 지울 수 있어야 하고, 지운 댓글은 새로고침 없이 목록에서 바로 사라져야 한다.
- **작업**
  - 추가 : 테스트 `commentDelete.test.tsx` — 2번 댓글의 `삭제` 를 누르면 `2번 댓글을 정말로 삭제하시겠습니까?` 확인창, 확인하면 `DELETE /api/v1/posts/1/comments/2` 호출, 응답 메세지 `alert`, 목록에서 2번 댓글만 사라지는지 / 취소하면 호출이 없고 목록이 그대로인지 확인
- **설명**
  - 실패 확인 : 댓글 삭제 버튼이 없어 `Unable to find an accessible element with the role "button" and name "삭제"` 로 2개 테스트가 실패한다.

### 009-2 댓글 삭제

- **[링크](https://github.com/bin0421/NewSBB-5/commit/2abe365098f00767c689e7870bb073989dd13297)**
- **원인** : 009-1 테스트가 실패한다. 댓글 삭제 기능이 없다.
- **작업**
  - 수정 : `PostCommentSection` — 댓글마다 `삭제` 버튼, `deleteComment(commentId)` 추가
- **설명**
  - 요청이 성공하면 댓글 상태에서도 그 댓글을 빼서 화면에 바로 반영한다 (32·33강).
  - 강의는 바깥의 `postComments` 값으로 새 목록을 만들지만, 여기서는 `setPostComments(prev => ...)` 함수형 업데이트로 응답이 온 시점의 최신 목록을 기준으로 바꾼다. 요청 사이에 목록이 바뀌어도 그 변경을 잃지 않는다.
  - 결과 : 테스트 25개 통과.

### 010-1 댓글 작성 테스트 추가 (실패)

- **[링크](https://github.com/bin0421/NewSBB-5/commit/99ec1269ac6be6893de6961a3d653890e1ab867d)**
- **원인** : 상세 페이지에서 댓글을 쓸 수 있어야 하고, 쓴 댓글은 바로 목록에 보여야 한다.
- **작업**
  - 추가 : 테스트 `commentWrite.test.tsx` — 내용이 공백뿐이면 `댓글 내용을 입력해주세요.` 경고와 포커스, `POST` 없음 / 올바르면 앞뒤 공백을 뺀 `{content}` 로 `POST /api/v1/posts/1/comments`, 응답 메세지 `alert`, 입력 칸 비움, 목록에 `2 : 새 댓글` 추가 확인
- **설명**
  - 실패 확인 : 댓글 작성 폼이 없어 `Unable to find role="heading" and name "댓글 작성"` 등으로 2개 테스트가 실패한다.

### 010-2 댓글 작성

- **[링크](https://github.com/bin0421/NewSBB-5/commit/a2ec6d607d97be30a36fb158437debc91f985a94)**
- **원인** : 010-1 테스트가 실패한다. 댓글 작성 폼이 없다.
- **작업**
  - 수정 : `PostCommentSection` — 댓글 목록 위에 `댓글 작성` 폼과 `handleCommentWriteFormSubmit` 추가
- **설명**
  - 응답의 `data` 가 새로 저장된 댓글(`PostCommentDto`)이므로 목록을 다시 불러오지 않고 상태 끝에 붙인다. 이것도 함수형 업데이트로 한다 (34강).
  - 성공하면 입력 칸을 비워 이어서 쓸 수 있게 한다.
  - 결과 : 테스트 27개 통과. 요구한 9개 기능을 모두 구현했다.

### 011-1 유효성 검사 세분화 테스트 추가 (실패)

- **[링크](https://github.com/bin0421/NewSBB-5/commit/1b840df5fc066d6f107d4e307caf10c7301d2299)**
- **원인** : 35강. 지금 폼은 빈 값만 막는다. 백엔드는 제목·내용·댓글을 2자 이상으로 제한하므로(`@Size(min = 2)`) 1자를 보내면 400 응답을 받는다. 서버에 보내기 전에 같은 규칙으로 막아야 한다.
- **작업**
  - 추가 : 테스트 `validation.test.tsx`
    - 길이 규칙 `POST_TITLE`(2\~100), `POST_CONTENT`(2\~5000), `COMMENT_CONTENT`(2\~100)이 백엔드 제약과 같은지, `checkLength(value, rule)` 가 빈 값이면 `제목을 입력해주세요.`, 짧으면 `제목을 2자 이상 입력해주세요.`, 통과하면 `null` 을 돌려주는지
    - 글쓰기 : 제목·내용 칸에 `maxLength` 100·5000, 제목·내용이 1자면 경고·포커스, API 호출 없음
    - 글 수정 : 같은 규칙(제목 1자 경고, `PUT` 없음)
    - 댓글 작성 : `maxLength` 100, 1자면 `댓글 내용을 2자 이상 입력해주세요.` 경고·포커스, `POST` 없음
- **설명**
  - 강의는 글쓰기·댓글 폼마다 `if` 문을 하나씩 더 붙인다. 여기서는 규칙과 안내 문구를 한 모듈(`@/lib/validation`)에 두고 모든 폼이 같이 쓰도록 테스트를 짰다.
  - 최대 길이는 `maxLength` 속성으로 입력 자체를 막는다. 그래서 테스트는 속성이 걸려 있는지만 확인한다.
  - 실패 확인 : `@/lib/validation` 이 없어 import 에서 실패한다.

### 011-2 유효성 검사 세분화

- **[링크](https://github.com/bin0421/NewSBB-5/commit/153dee29b274b90c6fcd34fe3bdacc6532134c15)**
- **원인** : 011-1 테스트가 실패한다. 길이 규칙 모듈이 없고, 폼은 빈 값만 검사한다.
- **작업**
  - 추가 : `src/lib/validation.ts`
    - 규칙 `POST_TITLE`, `POST_CONTENT`, `COMMENT_CONTENT` — `label`, `min`, `max`
    - `checkLength(value, rule)` — 안내 문구 또는 `null`
    - `validateField(field, rule)` — 앞뒤 공백 제거, 검사, 실패하면 경고·포커스 후 `false`
  - 수정 : `PostForm`
    - 이전 : 제목·내용마다 `trim()` 과 빈 값 검사 `if` 문
    - 이후 : `validateField(titleInput, POST_TITLE)`, `validateField(contentTextarea, POST_CONTENT)`, 입력 칸에 `maxLength`, 내용 칸 `rows={10}`
  - 수정 : `PostCommentSection` 댓글 작성 폼
    - 이전 : `trim()` 과 빈 값 검사 `if` 문
    - 이후 : `validateField(contentTextarea, COMMENT_CONTENT)`, `maxLength`, `rows={5}`
- **설명**
  - 안내 문구는 규칙의 `label` 로 만든다. 빈 값 문구(`제목을 입력해주세요.` 등)가 이전과 같으므로 기존 테스트도 그대로 통과한다.
  - `checkLength` 는 DOM 을 모르는 순수 함수라 따로 테스트할 수 있고, `validateField` 는 폼에서 되풀이하던 공백 제거·경고·포커스를 맡는다.
  - 글 수정 페이지는 `PostForm` 을 쓰므로 고치지 않아도 같은 규칙이 적용된다. (강의는 글쓰기와 댓글 폼만 고친다.)
  - 결과 : 테스트 34개 통과.

### 012-1 API 오류 처리 테스트 추가 (실패)

- **[링크](LINK:012-1)**
- **원인** : 36강. `fetch` 는 응답 코드가 4xx·5xx 여도 reject 하지 않는다. 지금은 실패 응답도 성공처럼 처리해서, 예를 들어 글쓰기가 400 을 받으면 `data.data` 가 `null` 이라 오류가 나거나 엉뚱한 곳으로 이동한다. 실패를 알리고 아무것도 바꾸지 않아야 한다.
- **작업**
  - 추가 : 테스트 `apiError.test.tsx`
    - `apiFetch` 가 4xx·5xx 응답이면 `ApiError` 로 reject 하고 `status`, `resultCode`, `msg` 를 담는지
    - 글 목록·글 상세 불러오기, 글쓰기, 글 수정, 글 삭제, 댓글 작성, 댓글 삭제가 실패하면 `resultCode : msg` 형식으로 알리는지
    - 실패하면 이동(`router.replace`)하지 않고, 댓글 작성은 입력한 내용과 목록을, 댓글 삭제는 그 댓글을 그대로 두는지
- **설명**
  - 강의는 실패 응답 본문(객체)을 그대로 `throw` 한다. 여기서는 `Error` 를 상속한 `ApiError` 로 감싸기로 하고 `toBeInstanceOf(ApiError)` 로 확인한다. `Error` 를 상속하면 스택 정보가 남고, 네트워크 오류 같은 다른 예외와 `instanceof` 로 구별할 수 있다.
  - 실패 확인 : `ApiError` 가 없어 `The instanceof assertion needs a constructor but undefined was given.`, 화면 테스트 7개는 오류 알림이 없어 `expected "bound " to be called with arguments` 로 모두 8개가 실패한다.
