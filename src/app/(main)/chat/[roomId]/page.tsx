import { requireUserId } from "@/features/auth/server-guards";
import ChatRoom from "@/features/chat/chat-room";

// 채팅방은 사용자별 접근 상태가 달라지므로 정적 캐시 대상에서 제외합니다.
export const dynamic = "force-dynamic";

export default async function ChatRoomPage() {
  // 이번 브랜치에서는 로그인 여부만 서버에서 확인합니다.
  // buyer/seller 권한 검증은 chat access 브랜치에서 별도로 처리합니다.
  await requireUserId();

  return <ChatRoom />;
}
