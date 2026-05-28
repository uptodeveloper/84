import { getProducts } from "@/api/item";
import { useInfiniteQuery } from "@tanstack/react-query";
import {
  getNextItemPageParam,
  ITEM_PAGE_SIZE,
} from "@/features/item/pagination";

export function useInfiniteItemData(
  term: string,
  category: string,
  initialPageParam = 0,
) {
  return useInfiniteQuery({
    queryKey: ["products", "list", term, category, initialPageParam],
    queryFn: async ({ pageParam }) => {
      const from = pageParam * ITEM_PAGE_SIZE;
      const to = from + ITEM_PAGE_SIZE - 1;
      const items = await getProducts({ from, to, term, category });

      return items;
    },

    initialPageParam,
    getNextPageParam: (lastPage, allPages) =>
      getNextItemPageParam(lastPage, allPages, initialPageParam),
  });
}
