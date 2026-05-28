import "server-only";

import type { Product, ProductListParams } from "@/types";
import {
  getItemDetailCacheTags,
  getItemHomeCacheTags,
} from "@/features/item/cache-tags";

function getSupabaseRestConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase REST environment variables are missing.");
  }

  return { supabaseUrl, supabaseKey };
}

export async function getCachedItem(itemId: string): Promise<Product | null> {
  const { supabaseUrl, supabaseKey } = getSupabaseRestConfig();
  const url = new URL("/rest/v1/products", supabaseUrl);
  url.searchParams.set("id", `eq.${itemId}`);
  url.searchParams.set("select", "*");

  // Supabase SDK 대신 fetch를 써야 Next가 이 요청에 캐시 태그를 붙일 수 있다.
  // 이후 서버 액션에서 item:<id> 태그를 갱신하면 이 상세 조회 캐시만 다시 만든다.
  const response = await fetch(url, {
    cache: "force-cache",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    next: {
      tags: getItemDetailCacheTags(itemId),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch product ${itemId}: ${response.status}`);
  }

  const products = (await response.json()) as Product[];
  return products[0] ?? null;
}

export async function getHomeProducts({
  term,
  category,
  from,
  to,
}: ProductListParams): Promise<Product[]> {
  const { supabaseUrl, supabaseKey } = getSupabaseRestConfig();
  const url = new URL("/rest/v1/products", supabaseUrl);
  const normalizedTerm = term?.trim();
  const normalizedCategory =
    category && category !== "전체" ? category : undefined;

  url.searchParams.set("select", "*");
  url.searchParams.set("order", "created_at.desc");

  if (normalizedTerm) {
    url.searchParams.set("title", `ilike.*${normalizedTerm}*`);
  }

  if (normalizedCategory) {
    url.searchParams.set("category", `eq.${normalizedCategory}`);
  }

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    Range: `${from}-${to}`,
  };

  // 검색어는 조합이 많고 어떤 mutation이 어떤 검색어에 영향을 주는지 알기 어렵다.
  // 그래서 검색 결과는 태그 캐시 대상에서 빼고 요청 시점에 조회한다.
  // 기본 홈/카테고리 목록만 태그 캐시를 사용한다.
  const response = normalizedTerm
    ? await fetch(url, {
        cache: "no-store",
        headers,
      })
    : await fetch(url, {
        cache: "force-cache",
        headers,
        next: {
          tags: getItemHomeCacheTags(normalizedCategory),
        },
      });

  if (!response.ok) {
    throw new Error(`Failed to fetch home products: ${response.status}`);
  }

  return (await response.json()) as Product[];
}
