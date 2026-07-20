import type { MessageEntity } from "@/types";

export function appendMessageToCache(
  messages: MessageEntity[] | undefined,
  incomingMessage: MessageEntity,
) {
  const currentMessages = messages ?? [];

  // 서버 액션 응답과 Realtime 이벤트가 같은 메시지를 전달할 수 있으므로 id로 중복을 제거합니다.
  if (currentMessages.some((message) => message.id === incomingMessage.id)) {
    return currentMessages;
  }

  return [...currentMessages, incomingMessage].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );
}
