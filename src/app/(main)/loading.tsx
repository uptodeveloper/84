import GlobalLoader from "@/components/global-loader";

// 인증 전체를 막는 로더가 아니라 서버 route가 다음 화면을 준비하는 동안만 표시합니다.
export default function MainLoading() {
  return <GlobalLoader />;
}
