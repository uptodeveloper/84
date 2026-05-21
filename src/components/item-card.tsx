"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useProductLike } from "@/hooks/queries/like/use-item-like";
import type { Tables } from "@/database.types";
// 훅 이름은 파일명이니 일단 유지 (내부 로직은 item으로 생각)

interface ItemCardProps {
  item: Tables<"products">;
  userId: string | null;
  showLikeButton?: boolean;
}

export default function ItemCard({
  item,
  userId,
  showLikeButton = false,
}: ItemCardProps) {
  // 훅에 item.id 전달
  const { isLiked, toggleLike } = useProductLike(item.id, userId);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault(); // 링크 이동 막기
    e.stopPropagation(); // 이벤트 전파 막기

    if (!userId) {
      alert("로그인이 필요합니다."); // 또는 toast 사용
      return;
    }
    toggleLike();
  };

  return (
    <Link
      href={`/item/${item.id}`} // URL도 item으로 통일
      className="border rounded-lg overflow-hidden hover:shadow-md transition group bg-white relative block"
    >
      {/* 썸네일 영역 */}
      <div className="aspect-square bg-gray-100 overflow-hidden relative">
        {item.image?.[0] ? (
          <img
            src={item.image[0]}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            alt={item.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            이미지 없음
          </div>
        )}

        {/* 찜 버튼 (우상단) */}
        {showLikeButton && (
          <button
            onClick={handleLike}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-all z-10"
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isLiked ? "fill-red-500 text-red-500" : "text-gray-300"
              }`}
            />
          </button>
        )}
        {/* 🟢 [추가] 판매 완료 오버레이 */}
        {item.status === "SOLD_OUT" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg z-20">
            판매완료
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="p-3">
        <h3 className="font-medium truncate text-gray-900">{item.title}</h3>
        <p className="font-bold text-lg mt-1">
          {Number(item.price).toLocaleString()}원
        </p>
        <div className="flex justify-between items-center mt-2">
          <span
            className={`text-xs px-2 py-1 rounded ${
              item.status === "SOLD_OUT"
                ? "bg-gray-200 text-gray-500 font-medium"
                : "bg-green-100 text-green-700 font-medium"
            }`}
          >
            {item.status === "SOLD_OUT" ? "판매완료" : "판매중"}
          </span>
          <span className="text-xs text-gray-400">
            {item.category || "기타"}
          </span>
        </div>
      </div>
    </Link>
  );
}
