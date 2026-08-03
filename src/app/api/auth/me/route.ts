import { getCurrentUserId } from "@/features/auth/server-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // 공개 페이지를 동적 렌더링으로 바꾸지 않고, 개인화 UI에 필요한 최소 식별자만 전달합니다.
  const userId = await getCurrentUserId();

  return NextResponse.json(
    { userId },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}
