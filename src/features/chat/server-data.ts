import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MessageEntity } from "@/types";
import { canStartChat, isChatParticipant } from "./ownership";
import type { ChatRoomAccessTarget, ChatRoomListItem } from "./types";

// 이 파일의 조회 결과는 페이지의 요청 전용 QueryClient에 저장한 뒤 HydrationBoundary로 전달합니다.
export async function getChatRoomsServer(
  userId: string,
): Promise<ChatRoomListItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("chat_room")
    .select(
      `
      id,
      products (id, title, image, price),
      buyer_id,
      seller_id
    `,
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as ChatRoomListItem[];
}

export async function getAccessibleChatRoom(
  roomId: string,
  userId: string,
): Promise<ChatRoomAccessTarget | null> {
  const supabase = await createSupabaseServerClient();
  const { data: room, error } = await supabase
    .from("chat_room")
    .select("id, buyer_id, seller_id")
    .eq("id", roomId)
    .maybeSingle();

  if (error) throw error;
  if (!room) return null;

  // RLS와 별개로 애플리케이션 서버 경계에서도 buyer/seller 참여 여부를 확인합니다.
  if (!isChatParticipant({ room, userId })) return null;
  return room;
}

export async function getChatMessagesServer(
  roomId: string,
): Promise<MessageEntity[]> {
  // 호출 페이지가 먼저 채팅방 참여자를 검증한 뒤 해당 방의 초기 메시지만 조회합니다.
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", roomId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function canAccessDraftChat(
  productId: string,
  userId: string,
) {
  // /chat/new의 productId만 신뢰하지 않고 DB의 실제 seller_id를 기준으로 새 채팅 가능 여부를 판단합니다.
  const supabase = await createSupabaseServerClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id, seller_id")
    .eq("id", productId)
    .maybeSingle();

  if (error) throw error;

  return canStartChat({
    sellerId: product?.seller_id ?? null,
    userId,
  });
}
