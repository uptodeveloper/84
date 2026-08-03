import { getCurrentUserId } from "@/features/auth/server-auth";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  // 탭 포커스 복귀 등 브라우저에서 auth를 다시 확인할 때 최소 식별자만 no-store로 전달합니다.
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
