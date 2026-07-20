import { getCachedItem } from "@/api/item.server";
import { requireUserId } from "@/features/auth/server-guards";
import ItemForm from "@/features/item/item-form";
import { notFound } from "next/navigation";

interface ItemEditProps {
  params: Promise<{
    itemId: string;
  }>;
}

// 수정 페이지는 로그인 상태에 따라 접근 결과가 달라지므로 정적 캐시 대상에서 제외합니다.
export const dynamic = "force-dynamic";

export default async function ItemEdit({ params }: ItemEditProps) {
  const userId = await requireUserId();

  const { itemId } = await params;
  const product = await getCachedItem(itemId);

  // 수정 폼을 보여주기 전에 서버에서 판매자 여부를 확인하고, mutation 시점에도 DB 기준으로 다시 검증합니다.
  if (!product || product.seller_id !== userId) {
    notFound();
  }

  return <ItemForm userId={userId} initialProduct={product} />;
}
