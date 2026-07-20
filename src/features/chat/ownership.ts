import type { ChatRoomAccessTarget } from "./types";

export const CHAT_AUTH_ERROR_MESSAGES = {
  UNAUTHENTICATED: "로그인이 필요합니다.",
  FORBIDDEN: "채팅방에 접근할 권한이 없습니다.",
  NOT_FOUND: "채팅방을 찾을 수 없습니다.",
  INVALID_PRODUCT: "채팅할 상품을 찾을 수 없습니다.",
  OWN_PRODUCT: "본인 상품과는 채팅할 수 없습니다.",
} as const;

// 페이지에서는 boolean으로 404 여부를 결정하고, mutation에서는 아래 assert 함수로 오류를 발생시킵니다.
export function isChatParticipant({
  room,
  userId,
}: {
  room: ChatRoomAccessTarget;
  userId: string | null;
}) {
  return (
    !!userId && (room.buyer_id === userId || room.seller_id === userId)
  );
}

export function assertChatParticipant({
  room,
  userId,
}: {
  room: ChatRoomAccessTarget;
  userId: string | null;
}) {
  if (!userId) {
    throw new Error(CHAT_AUTH_ERROR_MESSAGES.UNAUTHENTICATED);
  }

  if (!isChatParticipant({ room, userId })) {
    throw new Error(CHAT_AUTH_ERROR_MESSAGES.FORBIDDEN);
  }
}

export function canStartChat({
  sellerId,
  userId,
}: {
  sellerId: string | null;
  userId: string | null;
}) {
  // 구매자는 로그인 사용자여야 하며 판매자 본인과의 채팅은 만들지 않습니다.
  return !!userId && !!sellerId && sellerId !== userId;
}

export function assertCanStartChat({
  sellerId,
  userId,
}: {
  sellerId: string | null;
  userId: string | null;
}) {
  if (!userId) {
    throw new Error(CHAT_AUTH_ERROR_MESSAGES.UNAUTHENTICATED);
  }

  if (!sellerId) {
    throw new Error(CHAT_AUTH_ERROR_MESSAGES.INVALID_PRODUCT);
  }

  if (sellerId === userId) {
    throw new Error(CHAT_AUTH_ERROR_MESSAGES.OWN_PRODUCT);
  }
}
