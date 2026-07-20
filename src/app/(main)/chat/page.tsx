import { requireUserId } from "@/features/auth/server-guards";
import ChatRoom from "@/features/chat/chat-room";
import { chatQueryKeys } from "@/features/chat/query-keys";
import { getChatRoomsServer } from "@/features/chat/server-data";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

// 채팅 목록은 로그인 사용자별 데이터이므로 정적 캐시 대상에서 제외합니다.
export const dynamic = "force-dynamic";

export default async function Chat() {
  const userId = await requireUserId();
  const queryClient = new QueryClient();

  // 인증 사용자별 초기 채팅방 목록을 요청 전용 QueryClient에 담아 브라우저 캐시로 전달합니다.
  await queryClient.prefetchQuery({
    queryKey: chatQueryKeys.rooms(userId),
    queryFn: () => getChatRoomsServer(userId),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ChatRoom userId={userId} />
    </HydrationBoundary>
  );
}
