import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCachedItem } from "@/api/item.server";
import ItemDetail from "@/features/item/item-detail";

interface ItemDetailPageProps {
  params: Promise<{
    itemId: string;
  }>;
}

export const dynamicParams = true;

export async function generateMetadata({
  params,
}: ItemDetailPageProps): Promise<Metadata> {
  const { itemId } = await params;
  const product = await getCachedItem(itemId);

  if (!product) {
    return {
      title: "상품을 찾을 수 없습니다",
    };
  }

  const firstImage = product.image?.[0];

  return {
    title: product.title,
    description: product.description,
    openGraph: {
      title: product.title,
      description: product.description,
      images: firstImage ? [{ url: firstImage, alt: product.title }] : [],
    },
  };
}

export default async function ItemDetailPage({
  params,
}: ItemDetailPageProps) {
  const { itemId } = await params;
  // 아직 인기 상품/랭킹 기준이 없으므로 generateStaticParams로 선생성하지 않는다.
  // 첫 요청에서 만들고, 이후에는 상품 태그 캐시를 재사용하는 기준 사례로 둔다.
  const product = await getCachedItem(itemId);

  if (!product) {
    notFound();
  }

  return <ItemDetail product={product} />;
}
