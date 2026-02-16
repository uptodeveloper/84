import supabase from "@/lib/supabase";
import type { ChatRoomParams } from "@/types";

// ---------------------------------------------------------
// 1. 방이 이미 존재하는지 확인 (Read Only)
// ---------------------------------------------------------
export const checkChatRoom = async ({
  product_id,
  buyer_id,
  seller_id,
}: ChatRoomParams) => {
  const { data, error } = await supabase
    .from("chat_room")
    .select("id")
    .eq("product_id", product_id)
    .eq("buyer_id", buyer_id)
    .eq("seller_id", seller_id)
    .maybeSingle(); // 있으면 객체, 없으면 null

  if (error) throw error;
  return data?.id || null; // ID 반환하거나 null
};

// ---------------------------------------------------------
// 2. 채팅방 입장하기 (Get or Create)
// - 방이 있으면 ID 반환
// - 없으면 새로 만들고 ID 반환
// ---------------------------------------------------------
export async function enterChatRoom(params: ChatRoomParams) {
  const existingRoomId = await checkChatRoom(params);

  if (existingRoomId) {
    return existingRoomId; // 이미 있으면 그 방 ID 리턴
  }

  // 없으면 새로 생성 (Create)
  const { data: newRoom, error } = await supabase
    .from("chat_room")
    .insert({
      product_id: params.product_id,
      seller_id: params.seller_id,
      buyer_id: params.buyer_id,
    })
    .select("id") // ID만 가져오면 됨
    .single();

  if (error) throw error;
  return newRoom.id;
}

//채팅
// 1. 메시지 전송 (Send)
export async function sendMessage({
  room_id,
  sender_id,
  content,
}: {
  room_id: string;
  sender_id: string;
  content: string;
}) {
  const { error } = await supabase
    .from("messages")
    .insert({ room_id, sender_id, content });
  if (error) throw error;
}

// 2. 메시지 목록 가져오기 (Load)
export async function getMessages(room_id: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("room_id", room_id)
    .order("created_at", { ascending: true }); // 과거 -> 최신 순 정렬
  if (error) throw error;
  return data;
}

// 3. 내 채팅방 목록 가져오기 (List)
// (상대방 닉네임, 상품명 등을 알기 위해 products, profiles 테이블과 조인)
export async function getMyChatRooms(userId: string) {
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
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`) // 내가 구매자거나 판매자인 방
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
