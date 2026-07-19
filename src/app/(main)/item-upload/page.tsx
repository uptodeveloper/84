import { requireUserId } from "@/features/auth/server-guards";
import ItemForm from "@/features/item/item-form";

// 상품 등록 페이지는 로그인 사용자만 접근하므로 사용자별 동적 응답으로 처리합니다.
export const dynamic = "force-dynamic";

export default async function ItemUpload() {
  // 폼 내부의 업로드/입력 UX는 아직 클라이언트에 남기고, 접근 차단만 서버에서 먼저 처리합니다.
  await requireUserId();

  return <ItemForm />;
}
