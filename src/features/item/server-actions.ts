"use server";

import { getCurrentUserId } from "@/features/auth/server-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product, ProductStatus } from "@/types";
import { updateTag } from "next/cache";
import {
  getItemCategoryCacheTag,
  getItemCacheTag,
  ITEM_HOME_CACHE_TAG,
} from "./cache-tags";
import { assertCanMutateItem, ITEM_AUTH_ERROR_MESSAGES } from "./ownership";

type ItemCacheTarget = {
  id: string;
  category?: string | null;
  previousCategory?: string | null;
};

export async function revalidateItemCachesAction(item?: ItemCacheTarget) {
  // 서버 액션 mutation 뒤에는 상세/홈/카테고리 캐시 태그를 같이 갱신합니다.
  // 이 함수는 기존 폼 mutation에서도 쓰이므로, auth 검증 없는 순수 캐시 갱신 역할로 남겨둡니다.
  if (item?.id) {
    updateTag(getItemCacheTag(item.id));
  }

  updateTag(ITEM_HOME_CACHE_TAG);

  if (item?.category) {
    updateTag(getItemCategoryCacheTag(item.category));
  }

  if (item?.previousCategory && item.previousCategory !== item.category) {
    updateTag(getItemCategoryCacheTag(item.previousCategory));
  }
}

async function getMutableItemOrThrow(itemId: string) {
  const supabase = await createSupabaseServerClient();

  // 권한 검증에는 클라이언트가 넘긴 sellerId를 믿지 않고 DB의 현재 seller_id를 다시 읽습니다.
  const { data: item, error } = await supabase
    .from("products")
    .select("id, seller_id, category")
    .eq("id", itemId)
    .maybeSingle();

  if (error) throw error;
  if (!item) throw new Error(ITEM_AUTH_ERROR_MESSAGES.NOT_FOUND);

  const userId = await getCurrentUserId();
  // 여기서부터 상품 변경 권한은 서버 쿠키에서 복원한 userId 기준으로만 판단합니다.
  assertCanMutateItem({ item, userId });

  return { supabase, item };
}

export async function deleteItemAction({ id }: { id: string }) {
  const { supabase, item } = await getMutableItemOrThrow(id);
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw error;

  await revalidateItemCachesAction({ id, category: item.category });
}

export async function updateItemStatusAction({
  id,
  status,
}: {
  id: string;
  status: ProductStatus;
}): Promise<Product> {
  const { supabase, item } = await getMutableItemOrThrow(id);
  const { data: product, error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await revalidateItemCachesAction({
    id: product.id,
    category: product.category,
    previousCategory: item.category,
  });

  return product;
}
