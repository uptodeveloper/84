import {
  enterChatRoom,
  getMessages,
  getMyChatRooms,
  sendMessage,
} from "@/api/chat";
import supabase from "@/lib/supabase";
import { useSession } from "@/store/session";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

export default function ChatPage() {
  const { roomId } = useParams(); // URL에서 방 번호 가져오기
  const [searchParams] = useSearchParams();
  const session = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null); // 자동 스크롤용

  // ⭐ "유령 방"인지 확인 (roomId가 'new'이면 아직 방 안 만들어진 상태)
  const isGhostRoom = roomId === "new";

  // 유령 방일 때 필요한 정보 (URL 쿼리 파라미터에서 추출)
  const ghostProductId = searchParams.get("productId");
  const ghostSellerId = searchParams.get("sellerId");

  // 1. 내 채팅방 목록 불러오기
  const { data: chatRooms } = useQuery({
    queryKey: ["chatRooms", session?.user?.id],
    queryFn: () => getMyChatRooms(session?.user?.id!),
    enabled: !!session?.user?.id,
  });

  // 2. 현재 방의 메시지 불러오기
  const { data: messages } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => getMessages(roomId!),
    enabled: !!roomId && !isGhostRoom,
  });

  // 3. 메시지 전송 Mutation
  const { mutate: send } = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setInputText(""); // 입력창 비우기
      if (roomId && !isGhostRoom) {
        queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
      }
    },
  });

  // ⭐ 4. 전송 핸들러 (유령 방 로직 포함)
  const handleSend = async () => {
    if (!inputText.trim() || !session?.user) return;

    let targetRoomId = roomId;

    try {
      // [상황 A] 유령 방에서 첫 메시지를 보낼 때 -> 방부터 만든다!
      if (isGhostRoom) {
        if (!ghostProductId || !ghostSellerId) return;

        // 1. 방 생성 API 호출
        const newRoomId = await enterChatRoom({
          product_id: ghostProductId,
          buyer_id: session.user.id,
          seller_id: ghostSellerId,
        });

        targetRoomId = newRoomId;

        // 2. URL을 진짜 방 번호로 교체 (뒤로가기 방지)
        navigate(`/chat/${newRoomId}`, { replace: true });
      }

      // [상황 B] 방이 존재할 때 (또는 방금 만듦) -> 메시지 전송
      if (targetRoomId && targetRoomId !== "new") {
        send({
          room_id: targetRoomId,
          sender_id: session.user.id,
          content: inputText,
        });
      }
    } catch (e) {
      console.error("전송 실패", e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSend();
    }
  };

  // ⭐ 5. 채팅 실시간 구독 (유령 방일 때는 구독 안 함)
  useEffect(() => {
    // 유령 방이거나 roomId가 없으면 구독하지 않음
    if (!roomId || isGhostRoom) return;

    console.log(`🔌 구독 시작: ${roomId}`);

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
        (payload) => {
          console.log("🔥 메시지 수신:", payload);
          queryClient.invalidateQueries({ queryKey: ["messages", roomId] });
        },
      )
      .subscribe();

    return () => {
      console.log(`🧹 구독 해제: ${roomId}`);
      supabase.removeChannel(channel);
    };
  }, [roomId, isGhostRoom, queryClient]);

  // ⭐ 5. [신규 추가] 채팅방 목록 실시간 구독 (새 방 생기면 바로 뜸!)
  useEffect(() => {
    if (!session?.user?.id) return;

    console.log("📂 채팅방 목록 구독 시작");

    // 나(User)와 관련된 채팅방이 변경되면 목록을 새로고침하는 채널
    const channel = supabase
      .channel(`my_chat_rooms_${session.user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT(새 방), UPDATE(안읽음 등) 모두 감지
          schema: "public",
          table: "chat_room",
          // 주의: 필터가 없으면 남의 방 생성 알림도 올 수 있음 (RLS가 막아주긴 함)
          // 확실하게 하려면 아래처럼 필터를 걸어야 하는데, OR 조건이 안 되므로
          // MVP 단계에서는 일단 테이블 전체를 감지하고 쿼리(getMyChatRooms)에서 거르는 방식을 씁니다.
        },
        (payload) => {
          console.log("📂 채팅방 변경 감지:", payload);
          // 목록 데이터를 다시 불러옵니다.
          queryClient.invalidateQueries({
            queryKey: ["chatRooms", session.user.id],
          });
        },
      )
      .subscribe();

    return () => {
      console.log("📂 채팅방 목록 구독 해제");
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, queryClient]);

  // 6. 스크롤 자동 내리기
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="max-w-5xl mx-auto px-4 h-[calc(100vh-250px)]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full border rounded-xl overflow-hidden shadow-sm bg-white">
        {/* [왼쪽] 채팅 목록 (모바일에서는 채팅방 들어가면 숨김) */}
        <div
          className={`border-r h-full flex flex-col ${roomId ? "hidden md:flex" : "flex"}`}
        >
          <div className="p-4 border-b font-bold bg-gray-50">채팅 목록</div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatRooms?.map((room) => (
              <Link
                key={room.id}
                to={`/chat/${room.id}`}
                className={`block p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${roomId === room.id ? "bg-orange-50 border-orange-200" : "bg-white"}`}
              >
                <p className="font-bold text-sm truncate">
                  {room.products?.title}
                </p>
                <p className="text-xs text-gray-400">대화하기</p>
              </Link>
            ))}
          </div>
        </div>

        {/* [오른쪽] 채팅방 (대화 내용) */}
        <div
          className={`col-span-2 h-full flex flex-col overflow-hidden ${!roomId ? "hidden md:flex" : "flex"}`}
        >
          {roomId ? (
            <>
              {/* 채팅방 헤더 */}
              <div className="p-4 border-b flex justify-between items-center bg-white shrink-0">
                <span className="font-bold">상대방 닉네임</span>
                <span className="text-sm text-gray-500">상품 정보 요약</span>
              </div>

              {/* 메시지 영역 */}
              <div
                ref={scrollRef}
                className="flex-1 bg-gray-50 p-4 overflow-y-auto flex flex-col gap-3 min-h-0 추가"
              >
                {messages?.map((msg) => {
                  const isMe = msg.sender_id === session?.user?.id;
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

              {/* 입력창 */}
              <div className="p-4 bg-white border-t flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                  placeholder="메시지를 입력하세요..."
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
            // 채팅방 선택 안 했을 때 (PC 버전)
            <div className="h-full flex items-center justify-center text-gray-400">
              채팅방을 선택해주세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
