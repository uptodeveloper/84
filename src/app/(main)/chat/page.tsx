import { requireUserId } from "@/features/auth/server-guards";
import ChatRoom from "@/features/chat/chat-room";

// 채팅 목록은 로그인 사용자별 데이터이므로 정적 캐시 대상에서 제외합니다.
export const dynamic = "force-dynamic";

export default async function Chat() {
  // 채팅 데이터 조회와 realtime 연결은 기존 클라이언트 흐름을 유지하고, 접근 차단만 서버로 옮깁니다.
  await requireUserId();

  return <ChatRoom />;
}
