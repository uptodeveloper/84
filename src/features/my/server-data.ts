import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/types";

type LikedProductRow = {
  product_id: string;
  products: Product | null;
};

export type MyPageData = {
  myItems: Product[];
  likedItems: Product[];
};

// 마이페이지 전용 서버 조회입니다.
// 브라우저 Supabase singleton을 쓰지 않고, SSR auth 쿠키가 연결된 server client로 사용자 데이터를 읽습니다.
export async function getMyPageData(userId: string): Promise<MyPageData> {
  const supabase = await createSupabaseServerClient();

  // 판매 목록과 찜 목록은 서로 독립적이라 병렬로 조회해 초기 응답 시간을 줄입니다.
  const [myProductsResult, likedProductsResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("likes")
      .select(
        `
        product_id,
        products (*)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (myProductsResult.error) throw myProductsResult.error;
  if (likedProductsResult.error) throw likedProductsResult.error;

  return {
    myItems: myProductsResult.data,
    // likes join 결과에는 삭제된 상품 등으로 null product가 섞일 수 있어 화면에 넘기기 전에 걸러냅니다.
    likedItems: (likedProductsResult.data as LikedProductRow[])
      .map((item) => item.products)
      .filter((product): product is Product => product !== null),
  };
}
