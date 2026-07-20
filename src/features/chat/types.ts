import type { Tables } from "@/database.types";
import type { ChatRoomEntity } from "@/types";

// 채팅 목록은 방 정보와 상품 요약을 함께 렌더링하므로 서버/브라우저 조회가 같은 형태를 공유합니다.
export type ChatRoomListItem = Pick<
  ChatRoomEntity,
  "id" | "buyer_id" | "seller_id"
> & {
  products: Pick<
    Tables<"products">,
    "id" | "title" | "image" | "price"
  > | null;
};

// 접근 권한 검증에는 메시지나 상품 전체가 아니라 참여자 식별 필드만 필요합니다.
export type ChatRoomAccessTarget = Pick<
  ChatRoomEntity,
  "id" | "buyer_id" | "seller_id"
>;
