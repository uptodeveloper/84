import type { Database } from "@/database.types";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseClientConfig } from "./config";

export async function updateSession(request: NextRequest) {
  const { supabaseUrl, supabaseKey } = getSupabaseClientConfig();
  let response = NextResponse.next({
    request,
  });

  // Proxy는 매 요청 초입에서 Supabase 세션을 확인하고, 만료된 토큰이 있으면 쿠키를 갱신합니다.
  // 서버 컴포넌트/액션이 같은 요청 안에서 최신 쿠키를 읽도록 request와 response 양쪽에 반영합니다.
  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({
          request,
        });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        // Auth cookie가 갱신된 응답만 CDN이나 reverse proxy에 저장되지 않도록 합니다.
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  // getClaims()는 JWT 검증 기반이라 서버 보호 로직에서 getSession()보다 신뢰하기 좋습니다.
  await supabase.auth.getClaims();

  return response;
}
