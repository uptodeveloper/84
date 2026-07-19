import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUserId() {
  const supabase = await createSupabaseServerClient();
  // 서버 액션에서 반복해서 쓰기 위한 최소 auth helper입니다.
  // 실패하면 null을 반환해 호출부가 "로그인 필요"로 처리하게 둡니다.
  const { data, error } = await supabase.auth.getClaims();

  if (error) return null;

  return data?.claims?.sub ?? null;
}
