import { useQuery } from "@tanstack/react-query";
import { getLikedProducts, getMyProducts } from "@/api/item";
import { useSession } from "@/store/session";
import { useState } from "react";
import ItemCard from "@/components/item-card";
import type { Product } from "@/types";

export default function MyPage() {
  const session = useSession();
  const userId = session?.user?.id ?? null;
  const [activeTab, setActiveTab] = useState<"sales" | "likes">("sales");

  const { data: myItems, isLoading: isLoadingMy } = useQuery({
    queryKey: ["myProducts", userId],
    queryFn: () => getMyProducts(userId ?? ""),
    enabled: !!userId,
  });

  const { data: likedItems, isLoading: isLoadingLike } = useQuery({
    queryKey: ["likedItems", userId],
    queryFn: () => getLikedProducts(userId ?? ""),
    enabled: !!userId,
  });

  const isLoading = isLoadingMy || isLoadingLike;
  const displayItems = activeTab === "sales" ? myItems : likedItems;

  if (!session?.user) return <div>로그인이 필요합니다.</div>;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="bg-gray-100 p-8 rounded-xl mb-8 flex items-center gap-6">
          <div className="w-20 h-20 bg-gray-300 rounded-full" />
          <div className="flex flex-col gap-2">
            <div className="h-8 w-32 bg-gray-300 rounded" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
        </div>

        <div className="border-b mb-6 pb-2">
          <div className="h-8 w-24 bg-gray-200 rounded" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="border rounded-lg overflow-hidden">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-5 w-1/2 bg-gray-200 rounded" />
                <div className="h-3 w-1/4 bg-gray-100 rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-gray-100 p-8 rounded-xl mb-8 flex items-center gap-6">
        <div className="w-20 h-20 bg-gray-300 rounded-full" />
        <div>
          <h2 className="text-2xl font-bold">{session.user.id}</h2>
          <p className="text-gray-500 text-sm mt-1">안녕하세요.</p>
        </div>
      </div>

      <div className="flex gap-6 border-b mb-6">
        <button
          onClick={() => setActiveTab("sales")}
          className={`pb-2 px-2 font-bold transition-colors text-lg ${
            activeTab === "sales"
              ? "border-b-2 border-black text-black"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          판매 내역 <span className="text-sm font-normal">({myItems?.length || 0})</span>
        </button>
        <button
          onClick={() => setActiveTab("likes")}
          className={`pb-2 px-2 font-bold transition-colors text-lg ${
            activeTab === "likes"
              ? "border-b-2 border-black text-black"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          찜 목록 <span className="text-sm font-normal">({likedItems?.length || 0})</span>
        </button>
      </div>

      {displayItems?.length === 0 ? (
        <div className="text-center py-32 text-gray-400 bg-gray-50 rounded-lg">
          {activeTab === "sales"
            ? "등록한 상품이 없습니다."
            : "찜한 상품이 없습니다."}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayItems?.map((item: Product) => (
            <ItemCard
              key={item.id}
              item={item}
              userId={userId}
              showLikeButton={activeTab === "likes"}
            />
          ))}
        </div>
      )}
    </div>
  );
}
