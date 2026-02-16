import { useQuery } from "@tanstack/react-query";
import { getMyProducts } from "@/api/item";
import { useSession } from "@/store/session";
import { Link } from "react-router-dom";

export default function MyPage() {
  const session = useSession();

  // 내 상품 목록 불러오기
  const { data: myProducts, isLoading } = useQuery({
    queryKey: ["myProducts", session?.user?.id],
    queryFn: () => getMyProducts(session?.user?.id!),
    enabled: !!session?.user?.id,
  });

  if (!session?.user) return <div>로그인이 필요합니다.</div>;
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        {/* 1. 프로필 스켈레톤 */}
        <div className="bg-gray-100 p-8 rounded-xl mb-8 flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full" />{" "}
          {/* 프사 자리 */}
          <div className="flex flex-col gap-2">
            <div className="h-8 w-32 bg-gray-300 rounded" /> {/* 이름 자리 */}
            <div className="h-4 w-20 bg-gray-200 rounded" />{" "}
            {/* 부가정보 자리 */}
          </div>
        </div>

        {/* 2. 탭 영역 스켈레톤 */}
        <div className="border-b mb-6 pb-2">
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>

        {/* 3. 상품 목록 그리드 스켈레톤 (4개 정도 가짜로 뿌림) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="border rounded-lg overflow-hidden">
              {/* 썸네일 */}
              <div className="aspect-square bg-gray-200" />
              {/* 텍스트 정보 */}
              <div className="p-3 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded" /> {/* 제목 */}
                <div className="h-5 w-1/2 bg-gray-200 rounded" /> {/* 가격 */}
                <div className="h-3 w-1/4 bg-gray-100 rounded mt-2" />{" "}
                {/* 상태 */}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* 1. 프로필 영역 (와이어프레임 상단) */}
      <div className="bg-gray-100 p-8 rounded-xl mb-8 flex items-center gap-6">
        <div className="w-20 h-20 bg-gray-300 rounded-full" /> {/* 프사 */}
        <div>
          <h2 className="text-2xl font-bold">{session.user.id}님</h2>
        </div>
      </div>

      {/* 2. 탭 영역 (지금은 제목만) */}
      <div className="border-b mb-6">
        <span className="inline-block border-b-2 border-black pb-2 font-bold px-4">
          판매 내역 ({myProducts?.length || 0})
        </span>
      </div>

      {/* 3. 상품 목록 (그리드) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {myProducts?.map((product) => (
          <Link
            key={product.id}
            to={`/item/${product.id}`}
            className="border rounded-lg overflow-hidden hover:shadow-md transition"
          >
            {/* 썸네일 */}
            <div className="aspect-square bg-gray-200">
              {product.image?.[0] && (
                <img
                  src={product.image[0]}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {/* 정보 */}
            <div className="p-3">
              <h3 className="font-medium truncate">{product.title}</h3>
              <p className="font-bold">
                {Number(product.price).toLocaleString()}원
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">
                  {product.status === "SOLD_OUT" ? "판매완료" : "판매중"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
