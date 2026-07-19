export const ITEM_AUTH_ERROR_MESSAGES = {
  UNAUTHENTICATED: "로그인이 필요합니다.",
  FORBIDDEN: "상품을 변경할 권한이 없습니다.",
  NOT_FOUND: "상품을 찾을 수 없습니다.",
} as const;

type ItemOwnershipTarget = {
  seller_id: string | null;
};

export function assertCanMutateItem({
  item,
  userId,
}: {
  item: ItemOwnershipTarget;
  userId: string | null;
}) {
  if (!userId) {
    throw new Error(ITEM_AUTH_ERROR_MESSAGES.UNAUTHENTICATED);
  }

  if (!item.seller_id || item.seller_id !== userId) {
    throw new Error(ITEM_AUTH_ERROR_MESSAGES.FORBIDDEN);
  }
}
