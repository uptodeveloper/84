import "server-only";

import type { Database } from "@/database.types";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseClientConfig } from "./config";

export async function createSupabaseServerClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseClientConfig();
  const cookieStore = await cookies();

  // 서버 컴포넌트/서버 액션에서 요청 쿠키를 읽어 현재 Supabase 세션을 복원합니다.
  // 이 client로 auth.getClaims()를 호출하면 서버에서도 userId를 확인할 수 있습니다.
  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // 서버 컴포넌트는 쿠키를 쓸 수 없습니다. 갱신/동기화는 proxy 경로가 담당합니다.
        }
      },
    },
  });
}
