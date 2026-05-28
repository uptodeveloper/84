import { getHomeProducts } from "@/api/item.server";
import HomeProductList from "@/features/home/home-product-list";

const HOME_PAGE_SIZE = 5;

interface HomeProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const searchTerm = params.q ?? "";
  const category = params.category ?? "전체";

  // 첫 페이지는 서버에서 먼저 가져와 빠르게 렌더링한다.
  // 검색어가 있으면 실시간 조회, 없으면 홈/카테고리 태그 캐시를 사용한다.
  const initialItems = await getHomeProducts({
    term: searchTerm,
    category,
    from: 0,
    to: HOME_PAGE_SIZE - 1,
  });

  return (
    <HomeProductList
      initialItems={initialItems}
      searchTerm={searchTerm}
      category={category}
    />
  );
}
