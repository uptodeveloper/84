import { requireUserId } from "@/features/auth/server-guards";
import ItemForm from "@/features/item/item-form";

// 상품 등록 페이지는 로그인 사용자만 접근하므로 사용자별 동적 응답으로 처리합니다.
export const dynamic = "force-dynamic";

export default async function ItemUpload() {
  // 서버에서 확인한 userId는 이미지 저장 경로에만 사용하고, DB의 seller_id는 서버 액션에서 다시 결정합니다.
  const userId = await requireUserId();

  return <ItemForm userId={userId} />;
}
