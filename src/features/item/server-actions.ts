"use server";

import { updateTag } from "next/cache";
import {
  getItemCategoryCacheTag,
  getItemCacheTag,
  ITEM_HOME_CACHE_TAG,
} from "./cache-tags";

type ItemCacheTarget = {
  id: string;
  category?: string | null;
  previousCategory?: string | null;
};

export async function revalidateItemCachesAction(item?: ItemCacheTarget) {
  // 현재 인증은 브라우저 localStorage/Zustand 기반이라 서버 액션에서 Supabase 쓰기 권한을 안정적으로 알 수 없다.
  // 그래서 DB 변경은 클라이언트 Supabase 세션으로 처리하고, 서버 액션은 Next 캐시 태그 갱신만 담당한다.
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
