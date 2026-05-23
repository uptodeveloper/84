"use client";

import {
  enterChatRoom,
  getMessages,
  getMyChatRooms,
  sendMessage,
} from "@/api/chat";
import supabase from "@/lib/supabase";
import { useSession } from "@/store/session";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

export default function ChatRoom() {
  const params = useParams();
  const roomIdParam = params?.roomId;
  const roomId = Array.isArray(roomIdParam) ? roomIdParam[0] : roomIdParam;
  const searchParams = useSearchParams();
  const session = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const sessionUserId = session?.user?.id ?? null;

  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isGhostRoom = roomId === "new";
  const ghostProductId = searchParams?.get("productId");
  const ghostSellerId = searchParams?.get("sellerId");

  const { data: chatRooms } = useQuery({
    queryKey: ["chatRooms", sessionUserId],
    queryFn: () => getMyChatRooms(sessionUserId ?? ""),
    enabled: !!sessionUserId,
  });

  const { data: messages } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => getMessages(roomId ?? ""),
    enabled: !!roomId && !isGhostRoom,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });

  const { mutate: send } = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setInputText("");
      if (roomId && !isGhostRoom) {
        queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
      }
    },
  });

  const handleSend = async () => {
    if (!inputText.trim() || !sessionUserId) return;

    let targetRoomId = roomId;

    try {
      if (isGhostRoom) {
        if (!ghostProductId || !ghostSellerId) return;

        const newRoomId = await enterChatRoom({
          product_id: ghostProductId,
          buyer_id: sessionUserId,
          seller_id: ghostSellerId,
        });

        targetRoomId = newRoomId;
        router.replace(`/chat/${newRoomId}`);
      }

      if (targetRoomId && targetRoomId !== "new") {
        send({
          room_id: targetRoomId,
          sender_id: sessionUserId,
          content: inputText,
        });
      }
    } catch (error) {
      console.error("메시지 전송 실패", error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSend();
    }
  };

  useEffect(() => {
    if (!roomId || isGhostRoom) return;

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isGhostRoom, queryClient, roomId]);

  useEffect(() => {
    if (!sessionUserId) return;

    const channel = supabase
      .channel(`my_chat_rooms_${sessionUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_room",
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["chatRooms", sessionUserId],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, sessionUserId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="max-w-5xl mx-auto px-4 h-[calc(100vh-250px)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full border rounded-xl overflow-hidden shadow-sm bg-white">
        <div
          className={`border-r h-full flex flex-col ${roomId ? "hidden md:flex" : "flex"}`}
        >
          <div className="p-4 border-b font-bold bg-gray-50">채팅 목록</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatRooms?.map((room) => (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className={`block p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${roomId === room.id ? "bg-orange-50 border-orange-200" : "bg-white"}`}
              >
                <p className="font-bold text-sm truncate">
                  {room.products?.title}
                </p>
                <p className="text-xs text-gray-400">대화하러 가기</p>
              </Link>
            ))}
          </div>
        </div>

        <div
          className={`col-span-2 h-full flex flex-col overflow-hidden ${!roomId ? "hidden md:flex" : "flex"}`}
        >
          {roomId ? (
            <>
              <div className="p-4 border-b flex justify-between items-center bg-white shrink-0">
                <span className="font-bold">상대방과 대화 중</span>
                <span className="text-sm text-gray-500">상품 정보 요약</span>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 bg-gray-50 p-4 overflow-y-auto flex flex-col gap-3 min-h-0"
              >
                {messages?.map((msg) => {
                  const isMe = msg.sender_id === sessionUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`p-2 rounded-lg text-sm max-w-[70%] ${
                          isMe
                            ? "bg-orange-500 text-white rounded-tr-none"
                            : "bg-white border rounded-tl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 bg-white border-t flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                  placeholder="메시지를 입력하세요."
                />
                <button
                  onClick={handleSend}
                  className="bg-orange-500 text-white px-4 py-2 rounded-md font-bold"
                >
                  전송
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              채팅방을 선택해주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
