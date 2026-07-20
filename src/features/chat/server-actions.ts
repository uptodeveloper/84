"use server";

import { getCurrentUserId } from "@/features/auth/server-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { MessageEntity } from "@/types";
import {
  assertCanStartChat,
  assertChatParticipant,
  CHAT_AUTH_ERROR_MESSAGES,
} from "./ownership";

async function requireActionUserId() {
  // 모든 채팅 mutation은 클라이언트 userId 대신 요청 쿠키의 인증 사용자에서 시작합니다.
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error(CHAT_AUTH_ERROR_MESSAGES.UNAUTHENTICATED);
  }

  return userId;
}

async function getChatProductOrThrow(productId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("id, seller_id")
    .eq("id", productId)
    .maybeSingle();

  if (error) throw error;

  assertCanStartChat({
    sellerId: product?.seller_id ?? null,
    userId,
  });

  return { supabase, product: product! };
}

async function getActionChatRoomOrThrow(roomId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: room, error } = await supabase
    .from("chat_room")
    .select("id, buyer_id, seller_id")
    .eq("id", roomId)
    .maybeSingle();

  if (error) throw error;
  if (!room) throw new Error(CHAT_AUTH_ERROR_MESSAGES.NOT_FOUND);

  // sender_id를 정하기 전에 현재 사용자가 이 방의 buyer 또는 seller인지 다시 확인합니다.
  assertChatParticipant({ room, userId });
  return { supabase, room };
}

export async function findChatRoomAction({
  productId,
}: {
  productId: string;
}): Promise<string | null> {
  const userId = await requireActionUserId();
  const { supabase, product } = await getChatProductOrThrow(
    productId,
    userId,
  );

  // buyer/seller는 클라이언트 입력을 받지 않고 인증 사용자와 상품 DB 값으로 결정합니다.
  const { data: room, error } = await supabase
    .from("chat_room")
    .select("id")
    .eq("product_id", product.id)
    .eq("buyer_id", userId)
    .eq("seller_id", product.seller_id!)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return room?.id ?? null;
}

export async function enterChatRoomAction({
  productId,
}: {
  productId: string;
}): Promise<string> {
  const userId = await requireActionUserId();
  const { supabase, product } = await getChatProductOrThrow(
    productId,
    userId,
  );
  const sellerId = product.seller_id!;

  // 첫 메시지를 다시 시도해도 같은 상품/구매자/판매자의 기존 방을 우선 재사용합니다.
  const { data: existingRoom, error: selectError } = await supabase
    .from("chat_room")
    .select("id")
    .eq("product_id", product.id)
    .eq("buyer_id", userId)
    .eq("seller_id", sellerId)
    .limit(1)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existingRoom) return existingRoom.id;

  const { data: room, error } = await supabase
    .from("chat_room")
    .insert({
      product_id: product.id,
      buyer_id: userId,
      seller_id: sellerId,
    })
    .select("id")
    .single();

  if (error) throw error;
  return room.id;
}

export async function sendMessageAction({
  roomId,
  content,
}: {
  roomId: string;
  content: string;
}): Promise<MessageEntity> {
  const userId = await requireActionUserId();
  const messageContent = content.trim();

  if (!messageContent) {
    throw new Error("메시지를 입력해주세요.");
  }

  const { supabase } = await getActionChatRoomOrThrow(roomId, userId);

  // sender_id는 클라이언트가 지정하지 않고 서버 쿠키의 인증 사용자로 고정합니다.
  const { data: message, error } = await supabase
    .from("messages")
    .insert({
      room_id: roomId,
      sender_id: userId,
      content: messageContent,
    })
    .select()
    .single();

  if (error) throw error;
  return message;
}
