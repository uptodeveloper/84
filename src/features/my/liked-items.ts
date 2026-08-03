import type { Product } from "@/types";

export function removeLikedItem(items: Product[], productId: string) {
  return items.filter((item) => item.id !== productId);
}

export function restoreLikedItem(
  items: Product[],
  itemToRestore: Product,
  initialItems: Product[],
) {
  if (items.some((item) => item.id === itemToRestore.id)) return items;

  // mutation 실패 시 서버가 내려준 최초 정렬 순서를 기준으로 카드를 원래 위치에 되돌립니다.
  const initialOrder = new Map(
    initialItems.map((item, index) => [item.id, index]),
  );

  return [...items, itemToRestore].sort(
    (left, right) =>
      (initialOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
      (initialOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER),
  );
}
