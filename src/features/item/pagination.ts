export const ITEM_PAGE_SIZE = 5;

export function getNextItemPageParam<T>(
  lastPage: T[],
  allPages: T[][],
  initialPageParam = 0,
  pageSize = ITEM_PAGE_SIZE,
) {
  if (lastPage.length < pageSize) return undefined;
  return initialPageParam + allPages.length;
}
