"use client";

import { getMessages, getMyChatRooms } from "@/api/chat";
import supabase from "@/lib/supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { MessageEntity } from "@/types";
import { appendMessageToCache } from "./message-cache";
import { chatQueryKeys } from "./query-keys";
import { enterChatRoomAction, sendMessageAction } from "./server-actions";

interface ChatRoomProps {
  userId: string;
  roomId?: string;
  draftProductId?: string;
}

const CHAT_QUERY_STALE_TIME = 30_000;

export default function ChatRoom({
  userId,
  roomId,
  draftProductId,
}: ChatRoomProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [inputText, setInputText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isGhostRoom = roomId === "new";
  // effect 의존성이 매 렌더마다 바뀌어 채널이 재구독되지 않도록 query key 참조를 고정합니다.
  const roomsQueryKey = useMemo(() => chatQueryKeys.rooms(userId), [userId]);
  const messagesQueryKey = useMemo(
    () => chatQueryKeys.messages(userId, roomId ?? ""),
    [roomId, userId],
  );

  const { data: chatRooms } = useQuery({
    // 같은 key로 서버에서 hydrate된 데이터가 있으므로 마운트 직후 빈 로딩 상태를 거치지 않습니다.
    queryKey: roomsQueryKey,
    queryFn: () => getMyChatRooms(userId),
    staleTime: CHAT_QUERY_STALE_TIME,
  });

  const { data: messages } = useQuery({
    queryKey: messagesQueryKey,
    queryFn: () => getMessages(roomId ?? ""),
    enabled: !!roomId && !isGhostRoom,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: CHAT_QUERY_STALE_TIME,
  });

  const { mutateAsync: send, isPending: isSending } = useMutation({
    mutationFn: sendMessageAction,
    onSuccess: (message, variables) => {
      // 전송자는 서버 액션 결과를 즉시 반영하고, 뒤이어 오는 Realtime 이벤트는 id 중복 검사로 무시합니다.
      queryClient.setQueryData<MessageEntity[]>(
        chatQueryKeys.messages(userId, variables.roomId),
        (previousMessages) =>
          appendMessageToCache(previousMessages, message),
      );
      setInputText("");
    },
  });

  const handleSend = async () => {
    if (!inputText.trim() || isSubmitting) return;

    let targetRoomId = roomId;
    setIsSubmitting(true);

    try {
      if (isGhostRoom) {
        if (!draftProductId) return;

        const newRoomId = await enterChatRoomAction({
          productId: draftProductId,
        });

        targetRoomId = newRoomId;
        await queryClient.invalidateQueries({ queryKey: roomsQueryKey });
      }

      if (targetRoomId && targetRoomId !== "new") {
        await send({
          roomId: targetRoomId,
          content: inputText,
        });

        // 첫 메시지가 저장된 뒤 이동해 새 페이지의 서버 초기 조회와 전송 요청이 경쟁하지 않게 합니다.
        if (isGhostRoom) {
          router.replace(`/chat/${targetRoomId}`);
        }
      }
    } catch (error) {
      console.error("메시지 전송 실패", error);
      toast.error("메시지 전송에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSend();
    }
  };

  useEffect(() => {
    if (!roomId || isGhostRoom) return;

    let isCancelled = false;
    let channel: ReturnType<typeof supabase.channel> | undefined;

    const subscribeToMessages = async () => {
      try {
        // Realtime RLS가 인증 JWT를 사용하도록 브라우저 세션을 연결한 뒤 구독합니다.
        await supabase.realtime.setAuth();
        if (isCancelled) return;

        channel = supabase
          .channel(`room:${roomId}`)
          .on<MessageEntity>(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: `room_id=eq.${roomId}`,
            },
            (payload) => {
              queryClient.setQueryData<MessageEntity[]>(
                messagesQueryKey,
                (previousMessages) =>
                  appendMessageToCache(previousMessages, payload.new),
              );
            },
          )
          .subscribe((status, error) => {
            if (process.env.NODE_ENV === "development") {
              console.info(
                `[Realtime:messages:${roomId}]`,
                status,
                error ?? "",
              );
            }

            if (status === "SUBSCRIBED") {
              // 최초 연결과 재연결 시 서버 조회 이후 놓친 메시지만 한 번 보정합니다.
              void queryClient.invalidateQueries({
                queryKey: messagesQueryKey,
                exact: true,
              });
            }

            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              console.error(`[Realtime:messages:${roomId}]`, status, error);
            }
          });
      } catch (error) {
        console.error(`[Realtime:messages:${roomId}] 인증 실패`, error);
      }
    };

    void subscribeToMessages();

    return () => {
      isCancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [isGhostRoom, messagesQueryKey, queryClient, roomId]);

  useEffect(() => {
    let isCancelled = false;
    let channel: ReturnType<typeof supabase.channel> | undefined;

    const subscribeToRooms = async () => {
      try {
        // 방 목록 변경도 참여자 RLS를 통과해야 하므로 현재 브라우저 세션의 JWT를 Realtime에 연결합니다.
        await supabase.realtime.setAuth();
        if (isCancelled) return;

        channel = supabase
          .channel(`my_chat_rooms_${userId}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "chat_room",
            },
            () => {
              // Realtime payload에는 products 조인 정보가 없으므로 방 목록은 서버 데이터를 다시 조회합니다.
              void queryClient.invalidateQueries({ queryKey: roomsQueryKey });
            },
          )
          .subscribe((status, error) => {
            if (process.env.NODE_ENV === "development") {
              console.info(`[Realtime:rooms:${userId}]`, status, error ?? "");
            }

            if (status === "SUBSCRIBED") {
              // 구독이 준비되기 전에 생성된 방이 있을 수 있어 연결 직후 현재 목록을 한 번 동기화합니다.
              void queryClient.invalidateQueries({
                queryKey: roomsQueryKey,
                exact: true,
              });
            }

            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              console.error(`[Realtime:rooms:${userId}]`, status, error);
            }
          });
      } catch (error) {
        console.error(`[Realtime:rooms:${userId}] 인증 실패`, error);
      }
    };

    void subscribeToRooms();

    return () => {
      isCancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [queryClient, roomsQueryKey, userId]);

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
                  const isMe = msg.sender_id === userId;
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
                  disabled={isSubmitting}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                  placeholder="메시지를 입력하세요."
                />
                <button
                  onClick={handleSend}
                  disabled={isSubmitting || isSending}
                  className="bg-orange-500 text-white px-4 py-2 rounded-md font-bold disabled:opacity-50"
                >
                  {isSubmitting || isSending ? "전송 중" : "전송"}
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
