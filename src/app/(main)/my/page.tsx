import { requireUserId } from "@/features/auth/server-guards";
import { getMyPageData } from "@/features/my/server-data";
import MyShop from "@/features/my/my-shop";

// 로그인 사용자별 데이터가 섞이면 안 되므로 ISR/정적 캐시 대상에서 제외합니다.
export const dynamic = "force-dynamic";

export default async function My() {
  // /my는 첫 렌더 전에 서버 쿠키에서 로그인 사용자를 확인합니다.
  // 클라이언트 redirect보다 먼저 접근을 차단할 수 있습니다.
  const userId = await requireUserId();

  // 마이페이지의 초기 목록은 서버에서 바로 조회하고, 이후 탭 전환만 클라이언트에 남깁니다.
  const { myItems, likedItems } = await getMyPageData(userId);

  return <MyShop userId={userId} myItems={myItems} likedItems={likedItems} />;
}
