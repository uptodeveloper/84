import MemberOnlyLayout from "@/components/layout/member-only-layout";
import { getCachedItem } from "@/api/item.server";
import ItemForm from "@/features/item/item-form";
import { notFound } from "next/navigation";

interface ItemEditProps {
  params: Promise<{
    itemId: string;
  }>;
}

export default async function ItemEdit({ params }: ItemEditProps) {
  const { itemId } = await params;
  const product = await getCachedItem(itemId);

  if (!product) {
    notFound();
  }

  return (
    <MemberOnlyLayout>
      <ItemForm initialProduct={product} />
    </MemberOnlyLayout>
  );
}
