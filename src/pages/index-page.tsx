import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/api/item"; // 1단계에서 만든 함수
import { Link } from "react-router-dom"; // 페이지 이동용
import { Heart } from "lucide-react"; // 하트 아이콘 (없으면 텍스트로 대체 가능)
import MainSkeleton from "@/components/main-skeleton";

export default function IndexPage() {
  // 1. React Query로 진짜 데이터 가져오기
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  // 로딩 상태: 실제 레이아웃(배너 + 그리드)을 그대로 흉내 냅니다.
  if (isLoading) return <MainSkeleton />;

  return (
    <div className="space-y-8 px-4 md:px-0">
      {" "}
      {/* 좌우 여백 살짝 추가 */}
      {/* 배너 섹션 (그대로 유지) */}
      <section className="bg-orange-100 rounded-lg h-40 md:h-64 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-orange-600">
          PROJECT 84 배너 영역
        </h2>
      </section>
      {/* 상품 리스트 섹션 */}
      <section>
        <h3 className="text-xl font-bold mb-4">오늘의 상품 추천</h3>

        {/* 그리드: 모바일 2열 -> 태블릿 3열 -> PC 5열 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10">
          {/* 2. 진짜 데이터 뿌리기 (products가 없으면 빈 배열) */}
          {products?.map((product) => (
            <Link
              key={product.id}
              to={`/item/${product.id}`} // 👈 클릭 시 상세 페이지 이동
              className="flex flex-col gap-2 group cursor-pointer"
            >
              {/* 이미지 영역 */}
              <div className="aspect-[3/4] bg-gray-200 rounded-md overflow-hidden relative border border-gray-100">
                {/* 이미지가 있으면 첫 번째꺼 보여주고, 없으면 회색 박스 */}
                {product.image && product.image.length > 0 ? (
                  <img
                    src={product.image[0]} // 👈 배열의 첫 번째 사진(썸네일)
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    이미지 없음
                  </div>
                )}

                {/* 찜 버튼 (기능은 나중에) */}
                {/* <button className="absolute bottom-2 right-2 p-1.5 bg-black/20 hover:bg-black/40 rounded-full text-white transition">
                  <Heart size={16} fill="none" />
                </button> */}

                {/* 판매 완료 오버레이 */}
                {product.status === "SOLD_OUT" && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">
                    판매완료
                  </div>
                )}
              </div>

              {/* 텍스트 정보 */}
              <div className="px-1">
                <h4 className="font-medium text-sm line-clamp-2 h-10 leading-snug">
                  {product.title}
                </h4>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-base">
                    {Number(product.price).toLocaleString()}원{" "}
                    {/* 👈 쉼표 자동 추가 */}
                  </span>
                  {/* 시간은 '방금 전' 같은 라이브러리 쓰거나 일단 텍스트로 */}
                  <span className="text-xs text-gray-400">방금 전</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
