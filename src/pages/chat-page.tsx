import { getMessages, getMyChatRooms, sendMessage } from "@/api/chat";
import supabase from "@/lib/supabase";
import { useSession } from "@/store/session";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

export default function ChatPage() {
  const { roomId } = useParams(); // URL에서 방 번호 가져오기
  const session = useSession();
  const queryClient = useQueryClient();

  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null); // 자동 스크롤용

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
    enabled: !!roomId,
  });

  // 3. 메시지 전송 Mutation
  const { mutate: send } = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setInputText(""); // 입력창 비우기
      queryClient.invalidateQueries({ queryKey: ["messages", roomId] }); // 목록 새로고침
    },
  });

  // ⭐ 4. 실시간 구독 (상대방이 말하면 바로 뜸!)

  useEffect(() => {
    if (!roomId) return;

    // 1. 채널 생성 (유니크한 이름 사용)
    const channelName = `chat_room_${roomId}`;
    const channel = supabase.channel(channelName);

    // 2. 이벤트 리스너 설정
    channel
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
      .subscribe((status) => {
        // ⭐ 여기가 중요! 상태를 콘솔에 찍어보세요.
        console.log(`📡 실시간 연결 상태 (${channelName}):`, status);

        if (status === "SUBSCRIBED") {
          console.log("✅ 연결 성공! 메시지 받을 준비 완료.");
        }
        if (status === "CHANNEL_ERROR") {
          console.error("❌ 연결 에러! (잠시 후 다시 시도해보세요)");
        }
        if (status === "TIMED_OUT") {
          console.error("⏰ 연결 시간 초과! (네트워크 불안정)");
        }
      });

    // 3. 클린업 (뒷정리) - 이 부분이 없으면 좀비가 됩니다!
    return () => {
      console.log(`🧹 채널 정리(구독 해제): ${channelName}`);
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  // 5. 스크롤 자동 내리기
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || !session?.user || !roomId) return;
    send({
      room_id: roomId,
      sender_id: session.user.id,
      content: inputText,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleSend();
    }
  };

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
