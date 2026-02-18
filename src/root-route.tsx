import { Navigate, Route, Routes } from "react-router-dom";
import SignInPage from "./pages/sign-in-page";
import SignUpPage from "./pages/sign-up-page";
import ItemDetailPage from "./pages/item-detail-page";
// import ProfileDetailPage from "./pages/profile-detail-page";
import GlobalLayout from "./components/layout/global-layout";
import IndexPage from "./pages/index-page";
import GuestOnlyLayout from "./components/layout/guest-only-layout";
import MemberOnlyLayout from "./components/layout/member-only-layout";
import ItemCreatePage from "./pages/item-create-page";
import ChatPage from "./pages/chat-page";
import MyPage from "./pages/my-page";

export default function RootRoute() {
  return (
    <Routes>
      <Route element={<GuestOnlyLayout />}>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
      </Route>
      <Route element={<GlobalLayout />}>
        <Route path="/" element={<IndexPage />} />
        <Route path="/item/:itemId" element={<ItemDetailPage />} />

        <Route element={<MemberOnlyLayout />}>
          {/* <Route path="/profile/:userId" element={<ProfileDetailPage />} /> */}
          <Route path="/item-upload" element={<ItemCreatePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:roomId" element={<ChatPage />} />
          <Route path="/item/edit/:itemId" element={<ItemCreatePage />} />
          <Route path="/my" element={<MyPage />} />
        </Route>
        <Route path="*" element={<Navigate to={"/"} />} />
      </Route>
    </Routes>
  );
}
