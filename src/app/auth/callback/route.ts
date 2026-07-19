import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

function createAuthRedirect(requestUrl: URL, pathname: string) {
  const response = NextResponse.redirect(new URL(pathname, requestUrl.origin));

  // OAuth callback 응답에는 사용자별 auth cookie가 포함될 수 있으므로 공유 캐시를 막습니다.
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0",
  );
  response.headers.set("Expires", "0");
  response.headers.set("Pragma", "no-cache");

  return response;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return createAuthRedirect(requestUrl, "/sign-in?error=oauth_callback");
  }

  const supabase = await createSupabaseServerClient();
  // OAuth가 돌려준 code를 서버에서 세션 쿠키로 교환합니다.
  // 이 과정을 거쳐야 이후 서버 컴포넌트/액션에서 같은 로그인 사용자를 읽을 수 있습니다.
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return createAuthRedirect(requestUrl, "/sign-in?error=oauth_callback");
  }

  return createAuthRedirect(requestUrl, "/");
}
