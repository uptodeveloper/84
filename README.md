# 84 (팔사)

> 누구나 쉽게 8고 4는 중고 거래 마켓 MVP

84는 React SPA로 시작해 Next.js App Router로 전환한 중고 거래 프로젝트입니다.
상품 조회 구조와 서버·클라이언트 경계를 재구성하고, Supabase SSR Auth 기반의 서버 권한 검증을 적용했습니다.

## 주요 기능

- 상품 목록 조회와 무한 스크롤
- 상품 상세 조회
- 상품 등록·수정·삭제 및 판매 상태 변경
- Supabase Storage 기반 이미지 업로드
- 상품 찜하기
- 이메일 및 GitHub OAuth 로그인
- 판매 목록과 찜 목록을 제공하는 마이페이지
- 구매자와 판매자 간 1:1 Realtime 채팅

## v3 기술 스택

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- TanStack Query v5
- Supabase Auth, Database, Storage, Realtime
- `@supabase/ssr`

## v2에서 v3로 전환

- v2 React SPA: [84-react-mvp.vercel.app](https://84-react-mvp.vercel.app)
- v3 Next App Router: [84-next-app-router.vercel.app](https://84-next-app-router.vercel.app)

| 구분 | v2 React SPA | v3 Next App Router |
| --- | --- | --- |
| 실행 구조 | React 19 + Vite SPA | Next.js 16 App Router |
| 상품 초기 조회 | 브라우저 렌더링 후 React Query로 조회 | Server Component에서 조회 후 초기 HTML에 포함 |
| 이미지 전달 | `<img>`가 Supabase Storage 원본 URL 요청 | `next/image`가 화면 크기에 맞는 파생 이미지 전달 |
| 상품 캐시 | React Query 클라이언트 캐시 | Next.js tag 캐시와 필요한 영역의 React Query 캐시 |
| 인증 상태 | 브라우저 Supabase session과 Zustand에 의존 | 쿠키 기반 Supabase SSR Auth와 최소 viewer query |
| 보호 라우트 | 클라이언트 인증 확인 후 redirect | 서버에서 인증 확인 후 렌더링 전에 redirect |
| 상품 권한 검증 | 클라이언트 session으로 요청하고 RLS에서 최종 제한 | Server Action에서 판매자를 재검증하고 RLS를 함께 적용 |
| 채팅 접근 | 클라이언트에서 session과 방 정보를 확인 | 서버에서 참여자를 검증하고 초기 데이터 전달 후 Realtime 구독 |

v3 전환은 프레임워크 교체만을 목표로 하지 않고, 초기 데이터 조회와 권한 검증을 서버 경계로 이동하는 과정으로 진행했습니다. 입력 상태, toast, 무한 스크롤, 찜하기, 채팅 Realtime처럼 브라우저 상호작용이 필요한 기능은 클라이언트에 유지했습니다.

## v2 React SPA 구조

### 라우팅과 데이터 조회

- `BrowserRouter`와 `React.lazy`/`Suspense`로 클라이언트 라우팅과 페이지 단위 코드 분할을 구성했습니다.
- 앱 전체를 `QueryClientProvider`로 감싸고 상품 목록·상세, 마이페이지, 채팅 데이터를 React Query로 조회했습니다.
- 상품 상세와 마이페이지는 컴포넌트가 브라우저에서 렌더링된 뒤 Supabase에 데이터를 요청하고, 조회 중에는 스켈레톤을 표시했습니다.
- 상품 등록·수정·삭제·상태 변경은 브라우저 Supabase client에서 직접 실행하고, 최종 데이터 접근은 RLS 정책에 의존했습니다.

### 인증과 보호 라우트

- 전역 `SessionProvider`가 `onAuthStateChange`를 구독하고 Supabase session을 Zustand store에 저장했습니다.
- session 초기 확인이 끝날 때까지 전역 loader를 표시했습니다.
- `MemberOnlyLayout`이 Zustand session을 읽어 비로그인 사용자를 로그인 페이지로 이동시켰습니다.
- 상품 mutation과 마이페이지·채팅 조회에 필요한 `userId`도 클라이언트 session에서 가져왔습니다.

### 이미지와 실시간 상호작용

- 상품 이미지는 `<img>`로 Supabase Storage 원본 공개 URL을 직접 요청했습니다.
- 찜 상태는 React Query cache와 mutation으로 갱신했습니다.
- 채팅 페이지에서 Supabase Realtime 채널을 구독하고 새 메시지와 채팅방 변경을 클라이언트 cache에 반영했습니다.

## v3 Next App Router 구조

### 서버·클라이언트 경계

상품과 사용자별 초기 데이터는 Server Component에서 조회합니다.
입력 상태, 이미지 미리보기, toast, 무한 스크롤, 찜하기와 Realtime 채팅처럼 브라우저 상호작용이 필요한 기능은 Client Component에서 처리합니다.

### Supabase SSR Auth

Supabase client를 실행 환경에 따라 분리했습니다.

- Browser client: 클라이언트 상호작용과 Realtime 연결
- Server client: Server Component와 Server Action의 쿠키 기반 인증
- Proxy: 세션 갱신과 request/response cookie 동기화
- OAuth callback: auth code를 서버에서 session cookie로 교환

서버에서는 쿠키로 확인한 인증 사용자 ID를 기준으로 다음 권한을 검증합니다.

- 보호 라우트 접근
- 상품 등록·수정·삭제 및 상태 변경
- 마이페이지 사용자 데이터 조회
- 채팅방 참여자 확인과 메시지 전송자 결정

상품 판매자와 채팅 참여자를 기준으로 Supabase RLS도 함께 적용합니다.
전역 `SessionProvider`와 Zustand 인증 store는 제거했습니다. 서버는 쿠키에서 인증 사용자를 확인하고, 클라이언트는 `/api/auth/me`와 React Query의 viewer query로 최소 사용자 상태만 동기화합니다.

### 데이터 조회와 캐시

- 상품 목록과 상세: Next.js tag 기반 캐시와 mutation 후 무효화
- 홈 목록: 서버 초기 조회 후 클라이언트 무한 스크롤
- 마이페이지: 서버에서 인증 사용자와 초기 데이터 조회
- 채팅: 서버 prefetch 후 React Query Hydration
- 새 메시지: Supabase Realtime payload를 Query cache에 반영

인증이 필요한 페이지는 사용자별 응답이 정적 캐시되지 않도록 동적으로 렌더링합니다.

### 이미지 처리와 최적화

현재 상품 카드와 상품 상세 화면은 `next/image`를 사용합니다.

- 상품 카드: 반응형 `sizes` 적용
- 상품 상세: 단일 이미지 또는 캐러셀 첫 이미지 우선 로딩
- 상품 등록: 원본 이미지를 Supabase Storage에 업로드
- 상품 DB: Storage 공개 URL을 `string[]` 형태로 저장

화면 출력 단계에서는 `next/image`가 반응형 파생 이미지를 제공하지만, 업로드 원본 축소나 썸네일·상세용 파일 생성은 적용하지 않았습니다.

## 실행 방법

```bash
npm install
npm run dev
```

`.env.local`에 다음 환경 변수가 필요합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 검증 명령

```bash
npm test
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

## 성능 기록

React SPA와 Next.js App Router 버전의 Lighthouse 측정 환경과 결과는 [성능 비교 문서](./docs/performance/v2-v3-lighthouse.md)에서 확인할 수 있습니다.

Mobile Lighthouse 5회 중앙값 기준으로 두 이미지 조건 모두 FCP가 1.6s에서 0.9s로 단축됐습니다. 대용량 이미지 상품은 `next/image` 적용과 함께 LCP가 26.7s에서 3.3s로 단축됐지만, 일반 이미지 상품은 2.5s에서 3.2s로 증가했습니다.

보조 측정한 홈 화면에서는 첫 페이지 상품을 서버에서 렌더링하고 반응형 이미지를 전달한 v3의 중앙값이 FCP 1.6s에서 1.0s, LCP 2.3s에서 1.3s로 단축됐습니다.

대용량 상품의 실제 이미지 응답 파일도 v2 원본 JPEG 4.71 MiB에서 v3 WebP 파생 이미지 88.7 KiB로 약 98.2% 감소했습니다.

측정 결과는 해당 환경과 커밋을 기준으로 하며, 서버 초기 렌더링과 이미지 전달 방식이 함께 변경됐기 때문에 모든 차이를 App Router만의 효과로 해석하지 않습니다. SEO 감사도 스트리밍 metadata 반영 시점에 따라 91~100의 편차가 관찰됐습니다.

## 프로젝트 단계

- [x] React MVP 구현 및 배포
- [x] React 19 코드 정리
- [x] Next.js App Router 마이그레이션
- [x] 서버·클라이언트 컴포넌트 경계 분리
- [x] 상품 조회 캐시와 무한 스크롤 적용
- [x] Supabase SSR Auth와 서버 권한 검증 적용
- [x] 전역 `SessionProvider`와 Zustand 인증 상태 제거
- [x] 인증 전환 회귀 테스트와 Lighthouse 재측정

## 현재 MVP 제약

- 메시지 페이지네이션과 읽음 처리는 제공하지 않습니다.
- 업로드 이미지는 원본 축소나 별도 파생본 생성 없이 Supabase Storage에 저장합니다.
- Dashboard RLS 정책은 현재 Supabase 프로젝트에 직접 적용되어 있습니다.
