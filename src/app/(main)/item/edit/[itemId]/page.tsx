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
  // 이번 브랜치에서는 로그인 여부만 서버에서 확인합니다.
  // 판매자 권한 검증과 수정 mutation 전환은 item form/server action 브랜치에서 다룹니다.
  await requireUserId();

  const { itemId } = await params;
  const product = await getCachedItem(itemId);

  if (!product) {
    notFound();
  }

  return <ItemForm initialProduct={product} />;
}
