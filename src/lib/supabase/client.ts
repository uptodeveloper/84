import type { Database } from "@/database.types";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseClientConfig } from "./config";

export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabaseKey } = getSupabaseClientConfig();

  // 클라이언트 컴포넌트와 기존 React Query/API 함수가 사용하는 브라우저용 client입니다.
  // 세션 쿠키는 @supabase/ssr이 관리하므로 서버 auth와 같은 저장소를 바라봅니다.
  return createBrowserClient<Database>(supabaseUrl, supabaseKey);
}
