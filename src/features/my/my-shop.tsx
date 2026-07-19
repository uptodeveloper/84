"use client";

import InteractiveItemCard from "@/features/item/interactive-item-card";
import type { Product } from "@/types";
import { useState } from "react";

type MyShopProps = {
  userId: string;
  myItems: Product[];
  likedItems: Product[];
};

// 초기 데이터와 userId는 서버 페이지가 보장합니다.
// 이 컴포넌트는 탭 상태와 카드 인터랙션만 담당해 client auth/query 의존을 줄입니다.
export default function MyShop({ userId, myItems, likedItems }: MyShopProps) {
  const [activeTab, setActiveTab] = useState<"sales" | "likes">("sales");
  const displayItems = activeTab === "sales" ? myItems : likedItems;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-gray-100 p-8 rounded-xl mb-8 flex items-center gap-6">
        <div className="w-20 h-20 bg-gray-300 rounded-full" />
        <div>
          <h2 className="text-2xl font-bold">{userId}</h2>
          <p className="text-gray-500 text-sm mt-1">안녕하세요</p>
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
          판매 내역 <span className="text-sm font-normal">({myItems.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("likes")}
          className={`pb-2 px-2 font-bold transition-colors text-lg ${
            activeTab === "likes"
              ? "border-b-2 border-black text-black"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          찜 목록 <span className="text-sm font-normal">({likedItems.length})</span>
        </button>
      </div>

      {displayItems.length === 0 ? (
        <div className="text-center py-32 text-gray-400 bg-gray-50 rounded-lg">
          {activeTab === "sales"
            ? "등록한 상품이 없습니다."
            : "찜한 상품이 없습니다."}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayItems.map((item) => (
            <InteractiveItemCard
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
