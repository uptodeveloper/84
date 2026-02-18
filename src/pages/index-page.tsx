import { Link, useSearchParams } from "react-router-dom"; // 페이지 이동용
import MainSkeleton from "@/components/main-skeleton";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useInfiniteItemData } from "@/hooks/queries/item/use-infinite-item-data";
import { useSession } from "@/store/session";
import ItemCard from "@/components/item-card";

export default function IndexPage() {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("q") || ""; // URL에서 'q' 값 꺼내기 (없으면 빈 문자열)
  const category = searchParams.get("category") || "전체"; // 카테고리도 URL로 관리 가능
  const { ref, inView } = useInView();
  // 🟢 유저 정보 가져오기 (ItemCard에 넘겨줘야 함)
  const session = useSession();
  const userId = session?.user?.id || null;

  // 2. 무한 스크롤 훅 사용
  const {
    data: items,
    isLoading, // 로딩 상태 가져오기
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteItemData(searchTerm, category);

  useEffect(() => {
    fetchNextPage();
  }, [inView]);

  // 로딩 상태: 실제 레이아웃(배너 + 그리드)을 그대로 흉내 냅니다.
  if (isLoading) return <MainSkeleton />;

  return (
    <div className="space-y-8 px-4 md:px-0">
      {" "}
      {/* 좌우 여백 살짝 추가 */}
      {/* 배너 섹션 (그대로 유지) */}
      <section className="bg-orange-100 rounded-lg h-40 md:h-64 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-orange-600">84 배너 영역</h2>
      </section>
      {/* 상품 리스트 섹션 */}
      <section>
        <h3 className="text-xl font-bold mb-4">오늘의 상품 추천</h3>

        {/* 그리드: 모바일 2열 -> 태블릿 3열 -> PC 5열 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
          {items?.pages.map((page) =>
            page?.map((product) => (
              // 🟢 [핵심] 복잡한 코드 다 지우고 이거 하나면 끝!
              <ItemCard
                key={product.id}
                item={product}
                userId={userId}
                // showLikeButton={false} // 생략하면 기본값 false (하트 안 보임)
              />
            )),
          )}
        </div>
      </section>
      <div ref={ref} className="h-10 flex justify-center items-center">
        {isFetchingNextPage && <div>로딩중...</div>}
      </div>
    </div>
  );
}
