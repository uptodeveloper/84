export default function HomeProductListSkeleton() {
  return (
    <div className="space-y-8 px-4 md:px-0">
      {/* 1. 배너 스켈레톤 (높이 맞춤: h-40 ~ h-64) */}
      <div className="w-full h-40 md:h-64 bg-gray-200 rounded-lg animate-pulse" />

      {/* 2. 상품 리스트 스켈레톤 */}
      <section>
        {/* "오늘의 상품 추천" 제목 흉내 */}
        <div className="h-7 w-40 bg-gray-200 rounded mb-4 animate-pulse" />

        {/* 실제 그리드와 똑같은 간격/배치 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
          {/* 카드 10개 정도 반복해서 보여줌 */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              {/* 이미지 영역 (3:4 비율 유지) */}
              <div className="aspect-3/4 bg-gray-200 rounded-md animate-pulse" />

              {/* 텍스트 영역 (제목 두 줄 + 가격 한 줄) */}
              <div className="space-y-2 mt-1">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />

                <div className="flex justify-between items-center mt-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-1/5 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
