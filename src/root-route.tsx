import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react"; // 👈 lazy, Suspense 불러오기
import GlobalLayout from "./components/layout/global-layout";
import GuestOnlyLayout from "./components/layout/guest-only-layout";
import MemberOnlyLayout from "./components/layout/member-only-layout";
import GlobalLoader from "./components/global-loader"; // 👈 로딩 컴포넌트 (기존에 만드신 것 활용)

// 🟢 1. 페이지들을 Lazy Loading으로 변경
// 처음엔 파일 경로만 등록해두고, 실제 페이지에 접속할 때 다운로드 받습니다.
const SignInPage = lazy(() => import("./pages/sign-in-page"));
const SignUpPage = lazy(() => import("./pages/sign-up-page"));
const IndexPage = lazy(() => import("./pages/index-page"));
const ItemDetailPage = lazy(() => import("./pages/item-detail-page"));
const ItemCreatePage = lazy(() => import("./pages/item-create-page"));
const ChatPage = lazy(() => import("./pages/chat-page"));
const MyPage = lazy(() => import("./pages/my-page"));

export default function RootRoute() {
  return (
    <Suspense fallback={<GlobalLoader />}>
      <Routes>
        {/* 게스트 전용 (로그인 안 한 사람) */}
        <Route element={<GuestOnlyLayout />}>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
        </Route>
        {/* 공통 레이아웃 (헤더/푸터 있는 곳) */}
        <Route element={<GlobalLayout />}>
          <Route path="/" element={<IndexPage />} />
          <Route path="/item/:itemId" element={<ItemDetailPage />} />
          {/* 회원 전용 (로그인 한 사람) */}
          <Route element={<MemberOnlyLayout />}>
            <Route path="/item-upload" element={<ItemCreatePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:roomId" element={<ChatPage />} />
            <Route path="/item/edit/:itemId" element={<ItemCreatePage />} />
            <Route path="/my" element={<MyPage />} />
          </Route>
          <Route path="*" element={<Navigate to={"/"} />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
