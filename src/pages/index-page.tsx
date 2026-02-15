export default function IndexPage() {
  return (
    <div className="space-y-8">
      {/* 배너 섹션 */}
      <section className="bg-primary/10 rounded-lg h-64 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-primary">
          PROJECT 84 배너 영역
        </h2>
      </section>

      {/* 상품 리스트 섹션 */}
      <section>
        <h3 className="text-xl font-bold mb-4">오늘의 상품 추천</h3>

        {/* 그리드: 모바일 2열 -> 태블릿 3열 -> PC 5열 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
          {/* 상품 카드 10개 생성 (더미) */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 group cursor-pointer">
              {/* 이미지 영역 */}
              <div className="aspect-[3/4] bg-gray-200 rounded-md overflow-hidden relative">
                <img
                  src={`https://picsum.photos/300/400?random=${i}`}
                  alt="상품"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {/* 찜 버튼 오버레이 (나중에 기능 구현) */}
                <button className="absolute bottom-2 right-2 p-1 bg-black/20 rounded-full text-white">
                  ♡
                </button>
              </div>

              {/* 텍스트 정보 */}
              <div className="px-1">
                <h4 className="font-medium text-sm line-clamp-2">
                  아이폰 15 프로 맥스 자급제 팝니다 급처 {i + 1}
                </h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="font-bold text-base">1,200,000원</span>
                  <span className="text-xs text-gray-400">2분 전</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
