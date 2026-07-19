import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUserId } from "./server-auth";

export async function requireUserId() {
  // 보호 라우트는 클라이언트가 마운트되기 전에 서버에서 로그인 여부를 확정합니다.
  // 여기서는 "로그인 여부"만 확인하고, 상품/채팅방 소유권 검증은 후속 도메인 작업에서 처리합니다.
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect("/sign-in");
  }

  return userId;
}
