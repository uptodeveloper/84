import supabase from "@/lib/supabase";

// 채팅방 입장하기 (방이 없으면 만들고, 있으면 ID 반환)
export async function enterChatRoom({
  product_id,
  seller_id,
  buyer_id,
}: {
  product_id: string;
  seller_id: string;
  buyer_id: string;
}) {
  // 1. 이미 존재하는 방인지 확인
  const { data: existingRoom } = await supabase
    .from("chat_room")
    .select("id")
    .eq("product_id", product_id)
    .eq("buyer_id", buyer_id)
    .maybeSingle(); // single() 대신 maybeSingle() 써야 에러 안 남

  if (existingRoom) {
    return existingRoom.id; // 이미 있으면 그 방으로 입장!
  }

  // 2. 방이 없으면 새로 생성
  const { data: newRoom, error } = await supabase
    .from("chat_room")
    .insert({
      product_id,
      seller_id,
      buyer_id,
    })
    .select()
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

//방이 이미 존재하는 지 확인
export const checkChatRoom = async ({
  product_id,
  buyer_id,
  seller_id,
}: any) => {
  const { data, error } = await supabase
    .from("chat_room")
    .select("id")
    .eq("product_id", product_id)
    .eq("buyer_id", buyer_id)
    .eq("seller_id", seller_id)
    .maybeSingle(); // 0개 또는 1개

  if (error) throw error;
  return data?.id || null; // 방 ID 반환하거나 null
};
