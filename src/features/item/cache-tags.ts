export const ITEM_LIST_CACHE_TAG = "items";
export const ITEM_HOME_CACHE_TAG = "items:home";

export function getItemCacheTag(itemId: string): string {
  return `item:${itemId}`;
}

export function getItemCategoryCacheTag(category: string): string {
  return `items:category:${category}`;
}

export function getItemDetailCacheTags(itemId: string): string[] {
  // 상세 조회 캐시는 한 상품에만 묶는다.
  // 목록 갱신이 모든 상세 캐시를 함께 날리지 않도록 상세 태그를 좁게 유지한다.
  return [getItemCacheTag(itemId)];
}

export function getItemHomeCacheTags(category?: string): string[] {
  // 홈 기본 목록과 카테고리 목록은 같은 items 계열이지만 갱신 범위가 다르다.
  // 기본 홈은 items:home, 카테고리는 items:category:<category>로 따로 갱신한다.
  if (category) {
    return [ITEM_LIST_CACHE_TAG, getItemCategoryCacheTag(category)];
  }

  return [ITEM_LIST_CACHE_TAG, ITEM_HOME_CACHE_TAG];
}
