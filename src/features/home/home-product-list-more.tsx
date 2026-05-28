"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteItemData } from "@/hooks/queries/item/use-infinite-item-data";
import ItemCard from "@/features/item/item-card";

interface HomeProductListMoreProps {
  searchTerm: string;
  category: string;
}

export default function HomeProductListMore({
  searchTerm,
  category,
}: HomeProductListMoreProps) {
  const { ref, inView } = useInView();
  const {
    data: items,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useInfiniteItemData(searchTerm, category, 1);

  // 첫 페이지는 서버에서 이미 렌더링했으므로 무한스크롤은 2페이지부터 가져온다.
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
        {items?.pages.map((page) =>
          page?.map((product) => <ItemCard key={product.id} item={product} />),
        )}
      </div>
      <div ref={ref} className="h-10 flex justify-center items-center">
        {isFetchingNextPage && <div>로딩중...</div>}
      </div>
    </>
  );
}
