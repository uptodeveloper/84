import type { Product } from "@/types";
import ItemCard from "@/features/item/item-card";
import HomeProductListMore from "./home-product-list-more";

interface HomeProductListProps {
  initialItems: Product[];
  searchTerm: string;
  category: string;
}

export default function HomeProductList({
  initialItems,
  searchTerm,
  category,
}: HomeProductListProps) {
  return (
    <div className="space-y-8 px-4 md:px-0">
      <section className="bg-orange-100 rounded-lg h-40 md:h-64 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-orange-600">84 배너 영역</h2>
      </section>

      <section>
        <h3 className="text-xl font-bold mb-4">오늘의 상품 추천</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
          {initialItems.map((product) => (
            <ItemCard key={product.id} item={product} />
          ))}
        </div>
      </section>

      {/* 브라우저 스크롤 감지와 다음 페이지 로딩은 클라이언트 컴포넌트가 담당한다. */}
      <HomeProductListMore searchTerm={searchTerm} category={category} />
    </div>
  );
}
