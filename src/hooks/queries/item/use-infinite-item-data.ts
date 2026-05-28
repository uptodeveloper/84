import { getProducts } from "@/api/item";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { Product } from "@/types";

const PAGE_SIZE = 5;

export function useInfiniteItemData(
  term: string,
  category: string,
  initialPageParam = 0,
) {
  return useInfiniteQuery({
    queryKey: ["products", "list", term, category, initialPageParam],
    queryFn: async ({ pageParam }) => {
      const from = pageParam * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const items = await getProducts({ from, to, term, category });

      return items;
    },

    initialPageParam,
    getNextPageParam: (lastPage: Product[], allPages: Product[][]) => {
      if (lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length;
    },
  });
}
