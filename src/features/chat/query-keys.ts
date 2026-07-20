export const chatQueryKeys = {
  all: ["chat"] as const,
  // 브라우저에서 계정을 전환해도 이전 사용자의 캐시가 재사용되지 않도록 userId를 포함합니다.
  rooms: (userId: string) => ["chat", "rooms", userId] as const,
  // roomId가 같더라도 인증 사용자가 다르면 별도 메시지 캐시로 격리합니다.
  messages: (userId: string, roomId: string) =>
    ["chat", "messages", userId, roomId] as const,
};
