🛒 84 (팔사) - 중고 거래 마켓 MVP
"누구나 쉽게 8고 4는 공간"
본 프로젝트는 React SPA 기반의 중고 거래 플랫폼 MVP 버전입니다. 단순히 기능을 구현하는 것에 그치지 않고, 이후 React 19 고도화 및 Next.js 마이그레이션을 통해 성능 최적화 과정을 기록하기 위한 베이스 프로젝트로 기획되었습니다.

🛠 Tech Stack
Core
Framework: React 18 (Vite)

Language: TypeScript

State Management: TanStack Query v5, Zustand

Styling: Tailwind CSS, shadcn/ui

Backend (BaaS)
Infrastructure: Supabase (Auth, Database, Storage, Realtime)

🔥 Key Implementation

1. 상품 서비스
   홈 (상품 목록): useInfiniteQuery 기반의 무한 스크롤을 적용하여 대량의 상품 리스트를 효율적으로 로딩합니다.

상품 등록: Supabase Storage와 연동하여 이미지 업로드 및 미리보기 기능을 지원합니다.

2. 커뮤니케이션 & 인터랙션
   실시간 채팅: Supabase Realtime을 활용해 추가 서버 구축 없이 실시간 1:1 채팅을 구현했습니다.

찜하기 (좋아요): 낙관적 업데이트(Optimistic Update)를 적용하여 서버 응답 대기 없이 즉각적인 UI 피드백을 제공합니다.

3. 사용자 인증 및 마이 페이지
   인증: Supabase Auth를 활용한 이메일 및 소셜 로그인(GitHub) 시스템을 구축했습니다.

사용자 관리: 프로필 수정 및 판매 내역/찜한 목록 탭 구분 기능을 구현했습니다.

📈 Roadmap & Milestone
프로젝트의 성장 과정을 단계별로 기록하며, 각 이정표는 Git Tag로 관리됩니다.

[v] v1.0.0-react-spa: React 18 기반 MVP 개발 및 배포 완료 (Current)

[ ] v2.0.0-react-refactor: React 컴포넌트 구조 고도화 및 최적화 (Planned)

[ ] v3.0.0-next-migration: Next.js App Router 마이그레이션 (Planned)
