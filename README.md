# 84 (팔사) - 중고 거래 마켓

"누구나 쉽게 8고 4는 공간"

84는 React SPA 기반의 중고 거래 플랫폼입니다. MVP 기능 구현에서 끝내지 않고, React 버전 정비와 Next.js App Router 마이그레이션을 거치며 구조 개선과 성능 비교 과정을 기록하기 위한 프로젝트입니다.

## Tech Stack

### Core

- Framework: React 19, Vite
- Language: TypeScript
- State Management: TanStack Query v5, Zustand
- Styling: Tailwind CSS, shadcn/ui

### Backend

- Supabase Auth
- Supabase Database
- Supabase Storage
- Supabase Realtime

## Key Implementation

### 상품 서비스

- `useInfiniteQuery` 기반 무한 스크롤로 상품 목록을 페이지 단위로 조회합니다.
- Supabase Storage를 활용해 상품 이미지 업로드와 미리보기를 처리합니다.
- 상품 상세 페이지에서 판매 상태 변경, 수정, 삭제, 채팅 진입을 제공합니다.

### 커뮤니케이션 & 인터랙션

- Supabase Realtime을 활용해 별도 서버 없이 1:1 채팅을 구현했습니다.
- 좋아요 기능에는 optimistic update를 적용해 서버 응답 전에도 즉각적인 UI 피드백을 제공합니다.

### 인증 & 마이페이지

- Supabase Auth를 활용해 이메일 로그인과 GitHub 소셜 로그인을 제공합니다.
- 마이페이지에서 판매 내역과 좋아요한 상품 목록을 구분해 확인할 수 있습니다.

## Roadmap & Milestone

프로젝트의 성장 과정을 단계별로 기록하며, 각 이정표는 Git Tag로 관리합니다.

- [x] `v1.0.0-react-mvp`: React 기반 MVP 구현
- [x] `v1.0.1-react-mvp`: Vercel 동적 라우팅 이슈 수정
- [x] `v1.0.2-react-mvp`: MVP 배포 안정화
- [x] `v2.0.0-react-cleanup`: React 버전 코드 정비
- [ ] `v3.0.0-next-migration`: Next.js App Router 마이그레이션

## v2.0.0 React Cleanup

v2는 v3 마이그레이션 전, React 버전을 짧게 정비하고 비교 가능한 기준점으로 남기기 위한 단계입니다.

### 작업 내용

- Supabase generated type을 기반으로 API와 hooks의 타입을 정리했습니다.
- 상품 상세 페이지를 역할 기준으로 컴포넌트 분리했습니다.
  - `ProductMediaSection`: 상품 이미지와 판매자 정보 영역
  - `ProductInfoSection`: 상품 제목, 가격, 카테고리, 판매 상태 영역
  - `ProductActionSection`: 좋아요, 채팅, 수정, 삭제, 판매 상태 변경 액션 영역
- 중복으로 남아 있던 미사용 like 훅을 제거했습니다.
- `npm run build` 기준으로 React 버전 빌드가 통과하는 상태를 확인했습니다.

### 정리하지 않은 것

- React Query key 전면 재설계는 v3에서 데이터 패칭 구조가 바뀔 예정이라 진행하지 않았습니다.
- 전체 컴포넌트 구조 개편보다, v3 마이그레이션 전에 이해와 유지보수에 필요한 범위만 정리했습니다.

## v3 계획

v3에서는 기존 React SPA를 기준점으로 두고, 별도의 Next.js App Router 버전을 구성할 예정입니다.

- 새로운 Supabase 프로젝트 구성
- Next.js App Router 기반 라우팅 재구성
- 서버/클라이언트 데이터 패칭 구조 재설계
- React SPA(v2)와 Next.js(v3)의 성능 비교
