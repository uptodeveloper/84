import { getCurrentUserId } from "@/features/auth/server-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  // 로그인 사용자가 인증 화면을 다시 보지 않도록 이 route 진입 시 서버 쿠키로 먼저 차단합니다.
  const userId = await getCurrentUserId();

  if (userId) {
    redirect("/");
  }

  return children;
}
