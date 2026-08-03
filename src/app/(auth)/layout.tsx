import { getCurrentUserId } from "@/features/auth/server-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  // 로그인/회원가입 route에서만 쿠키를 확인해 공개 상품 route의 캐시 경계에는 영향을 주지 않습니다.
  const userId = await getCurrentUserId();

  if (userId) {
    redirect("/");
  }

  return children;
}
