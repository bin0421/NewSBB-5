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

- **[링크](LINK:002-1)**
- **원인** : 첫 화면과, 모든 페이지 위에 보일 메뉴가 필요하다. 먼저 보여야 할 내용을 테스트로 정한다.
- **작업**
  - 추가 : 테스트 `home.test.tsx` — 메인 페이지에 `안녕하세요.` 가 보이는지, 헤더에 `메인`(`/`)·`글 목록`(`/posts`) 링크가 있는지 확인
- **설명**
  - 헤더를 `layout.tsx` 안에 두면 `<html>`·`<body>` 까지 함께 그려야 해서 테스트하기 어렵다. 그래서 `SiteHeader` 컴포넌트로 떼어 테스트한다.
  - 실패 확인 : `SiteHeader` 가 없어 `Failed to resolve import "@/components/SiteHeader"` 로 실패한다.
