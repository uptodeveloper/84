import { requireUserId } from "@/features/auth/server-guards";
import ChatRoom from "@/features/chat/chat-room";
import { chatQueryKeys } from "@/features/chat/query-keys";
import {
  canAccessDraftChat,
  getAccessibleChatRoom,
  getChatMessagesServer,
  getChatRoomsServer,
} from "@/features/chat/server-data";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { notFound } from "next/navigation";

interface ChatRoomPageProps {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ productId?: string }>;
}

// 채팅방은 사용자별 접근 상태가 달라지므로 정적 캐시 대상에서 제외합니다.
export const dynamic = "force-dynamic";

export default async function ChatRoomPage({
  params,
  searchParams,
}: ChatRoomPageProps) {
  const userId = await requireUserId();
  const { roomId } = await params;
  const isDraftRoom = roomId === "new";
  let draftProductId: string | undefined;

  if (isDraftRoom) {
    const { productId } = await searchParams;

    if (!productId) {
      notFound();
    }

    // 새 채팅 진입도 상품의 실제 판매자를 서버에서 확인해 조작된 query string을 차단합니다.
    const canAccess = await canAccessDraftChat(productId, userId);
    if (!canAccess) {
      notFound();
    }

    draftProductId = productId;
  } else {
    const room = await getAccessibleChatRoom(roomId, userId);
    if (!room) notFound();
  }

  const queryClient = new QueryClient();
  // 방 목록과 메시지는 서로 독립된 조회이므로 병렬 prefetch한 뒤 하나의 hydration state로 전달합니다.
  const prefetches: Promise<void>[] = [
    queryClient.prefetchQuery({
      queryKey: chatQueryKeys.rooms(userId),
      queryFn: () => getChatRoomsServer(userId),
    }),
  ];

  if (!isDraftRoom) {
    prefetches.push(
      queryClient.prefetchQuery({
        queryKey: chatQueryKeys.messages(userId, roomId),
        queryFn: () => getChatMessagesServer(roomId),
      }),
    );
  }

  await Promise.all(prefetches);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ChatRoom
        userId={userId}
        roomId={roomId}
        draftProductId={draftProductId}
      />
    </HydrationBoundary>
  );
}
