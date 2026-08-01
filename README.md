# 84 (팔사)

> 누구나 쉽게 8고 4는 중고 거래 마켓 MVP

84는 React SPA로 시작해 Next.js App Router로 전환한 중고 거래 프로젝트입니다.
상품 조회 성능뿐 아니라 서버·클라이언트 경계, 인증 및 권한 검증 구조를 단계적으로 개선하고 있습니다.

## 주요 기능

- 상품 목록 조회와 무한 스크롤
- 상품 상세 조회
- 상품 등록·수정·삭제 및 판매 상태 변경
- Supabase Storage 기반 이미지 업로드
- 상품 찜하기
- 이메일 및 GitHub OAuth 로그인
- 판매 목록과 찜 목록을 제공하는 마이페이지
- 구매자와 판매자 간 1:1 Realtime 채팅

## 기술 스택

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- TanStack Query v5
- Zustand
- Supabase Auth, Database, Storage, Realtime
- `@supabase/ssr`

## 애플리케이션 구조

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
기존 `SessionProvider`와 Zustand 인증 상태는 클라이언트 UX를 위해 유지하고 있으며 후속 정리 범위를 검토하고 있습니다.

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
- 상품 상세: 대표 이미지 우선 로딩
- 상품 캐러셀: 첫 이미지만 우선 로딩
- 상품 등록: 원본 이미지를 Supabase Storage에 업로드
- 상품 DB: Storage 공개 URL을 `string[]` 형태로 저장

현재는 화면 출력 단계의 이미지 최적화가 일부 적용되어 있으며, 업로드 원본 축소나 썸네일·상세용 파생 이미지 정책은 적용하지 않았습니다.

후속 작업에서는 다음 순서로 이미지 정책을 검토합니다.

1. 화면별 실제 이미지 렌더링 크기와 전송량 측정
2. 카드와 상세 이미지의 `sizes`, 품질, 로딩 우선순위 조정
3. 업로드 전 과도하게 큰 원본 이미지 축소와 파일 검증
4. 같은 상품 페이지를 기준으로 이미지 전송량과 LCP 재측정
5. 운영 비용과 트래픽에 따라 Supabase Image Transformations 또는 파생 이미지 생성 여부 결정

현재 MVP에서는 `next/image` 정책 정교화와 업로드 전 원본 축소를 우선 후보로 둡니다.

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

측정 결과는 해당 환경과 커밋을 기준으로 하며, 모든 차이를 App Router 전환만의 효과로 해석하지 않습니다.

## 프로젝트 단계

- [x] React MVP 구현 및 배포
- [x] React 19 코드 정리
- [x] Next.js App Router 마이그레이션
- [x] 서버·클라이언트 컴포넌트 경계 분리
- [x] 상품 조회 캐시와 무한 스크롤 적용
- [x] Supabase SSR Auth와 서버 권한 검증 적용
- [ ] 클라이언트 인증 의존성과 레거시 코드 정리
- [ ] 인증 전환 회귀 테스트와 Lighthouse 재측정

## 후속 검토

- 이미지 크기·품질·로딩 우선순위 최적화
- 업로드 원본 축소와 파일 검증
- 메시지 페이지네이션과 읽음 처리
- 거래 및 결제 시스템 도입 여부 검토

## 현재 MVP 제약

- 메시지 페이지네이션과 읽음 처리는 제공하지 않습니다.
- 일부 클라이언트 인증 상태와 레거시 타입은 후속 작업에서 정리할 예정입니다.
- Dashboard RLS 정책은 현재 Supabase 프로젝트에 직접 적용되어 있습니다.
