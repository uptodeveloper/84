import { useQuery } from "@tanstack/react-query";
import { getLikedProducts, getMyProducts } from "@/api/item";
import { useSession } from "@/store/session";
import { useState } from "react";
import ItemCard from "@/components/item-card";

export default function MyPage() {
  const session = useSession();

  // 🟢 1. 탭 상태 관리 ('sales' | 'likes')
  const [activeTab, setActiveTab] = useState<"sales" | "likes">("sales");

  // 내 상품 목록 불러오기
  const { data: myItems, isLoading: isLoadingMy } = useQuery({
    queryKey: ["myProducts", session?.user?.id],
    queryFn: () => getMyProducts(session?.user?.id!),
    enabled: !!session?.user?.id,
  });

  // 🟢 3. 내가 찜한 상품 목록 데이터 (새로 추가)
  const { data: likedItems, isLoading: isLoadingLike } = useQuery({
    queryKey: ["likedItems", session?.user?.id],
    queryFn: () => getLikedProducts(session?.user?.id!),
    enabled: !!session?.user?.id,
  });

  // 로딩 상태 통합 (둘 중 하나라도 로딩 중이면 로딩)
  const isLoading = isLoadingMy || isLoadingLike;

  // 🟢 4. 현재 탭에 따라 보여줄 데이터 결정
  const displayItems = activeTab === "sales" ? myItems : likedItems;

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
      {/* 프로필 영역 */}
      <div className="bg-gray-100 p-8 rounded-xl mb-8 flex items-center gap-6">
        <div className="w-20 h-20 bg-gray-300 rounded-full" />
        <div>
          <h2 className="text-2xl font-bold">{session.user.id}님</h2>
          <p className="text-gray-500 text-sm mt-1">안녕하세요!</p>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="flex gap-6 border-b mb-6">
        <button
          onClick={() => setActiveTab("sales")}
          className={`pb-2 px-2 font-bold transition-colors text-lg ${
            activeTab === "sales"
              ? "border-b-2 border-black text-black"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          판매 내역{" "}
          <span className="text-sm font-normal">({myItems?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab("likes")}
          className={`pb-2 px-2 font-bold transition-colors text-lg ${
            activeTab === "likes"
              ? "border-b-2 border-black text-black"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          찜 목록{" "}
          <span className="text-sm font-normal">
            ({likedItems?.length || 0})
          </span>
        </button>
      </div>

      {/* 상품 목록 (이제 ItemCard만 반복하면 끝!) */}
      {displayItems?.length === 0 ? (
        <div className="text-center py-32 text-gray-400 bg-gray-50 rounded-lg">
          {activeTab === "sales"
            ? "등록한 상품이 없습니다."
            : "찜한 상품이 없습니다."}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayItems?.map((item: any) => (
            // 🟢 공용 컴포넌트 사용
            <ItemCard
              key={item.id}
              item={item}
              userId={session.user!.id}
              showLikeButton={activeTab === "likes"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
