"use client";

import { Heart } from "lucide-react";
import { useProductLike } from "@/hooks/queries/like/use-item-like";

interface ItemCardLikeButtonProps {
  productId: string;
  userId?: string | null;
}

export default function ItemCardLikeButton({
  productId,
  userId = null,
}: ItemCardLikeButtonProps) {
  const { isLiked, toggleLike } = useProductLike(productId, userId);

  const handleLike = () => {
    if (!userId) {
      alert("로그인이 필요합니다.");
      return;
    }

    toggleLike();
  };

  return (
    <button
      type="button"
      onClick={handleLike}
      className="absolute top-2 right-2 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-all z-10"
      aria-label="찜하기"
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          isLiked ? "fill-red-500 text-red-500" : "text-gray-300"
        }`}
      />
    </button>
  );
}
