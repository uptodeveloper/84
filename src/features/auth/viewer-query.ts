export type Viewer = {
  userId: string | null;
};

// 서버 prefetch와 브라우저 조회가 같은 인증 캐시를 사용하도록 키를 한곳에서 관리합니다.
export const viewerQueryKey = ["auth", "viewer"] as const;
