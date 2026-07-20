import supabase from "@/lib/supabase";
import type { ChatRoomListItem } from "@/features/chat/types";
import type { MessageEntity } from "@/types";

// 초기 데이터는 서버가 hydrate하지만, 포커스/재연결 복구 시에는 브라우저 Query가 RLS 범위로 다시 조회합니다.
export async function getMessages(room_id: string): Promise<MessageEntity[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", room_id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getMyChatRooms(
  userId: string,
): Promise<ChatRoomListItem[]> {
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
