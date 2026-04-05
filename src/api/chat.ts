import supabase from "@/lib/supabase";
import type {
  ChatRoomEntity,
  ChatRoomParams,
  MessageEntity,
  SendMessageInput,
} from "@/types";
import type { Tables } from "@/database.types";

type ChatRoomListItem = Pick<ChatRoomEntity, "id" | "buyer_id" | "seller_id"> & {
  products: Pick<Tables<"products">, "id" | "title" | "image" | "price"> | null;
};

export const checkChatRoom = async ({
  product_id,
  buyer_id,
  seller_id,
}: ChatRoomParams): Promise<string | null> => {
  const { data, error } = await supabase
    .from("chat_room")
    .select("id")
    .eq("product_id", product_id)
    .eq("buyer_id", buyer_id)
    .eq("seller_id", seller_id)
    .maybeSingle();

  if (error) throw error;
  return data?.id || null;
};

export async function enterChatRoom(params: ChatRoomParams): Promise<string> {
  const existingRoomId = await checkChatRoom(params);

  if (existingRoomId) {
    return existingRoomId;
  }

  const { data: newRoom, error } = await supabase
    .from("chat_room")
    .insert({
      product_id: params.product_id,
      seller_id: params.seller_id,
      buyer_id: params.buyer_id,
    })
    .select("id")
    .single();

  if (error) throw error;
  return newRoom.id;
}

export async function sendMessage({
  room_id,
  sender_id,
  content,
}: SendMessageInput): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .insert({ room_id, sender_id, content });

  if (error) throw error;
}

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
