"use client";

import { Heart } from "lucide-react";

interface ItemCardLikeButtonProps {
  onUnlike?: () => void;
}

export default function ItemCardLikeButton({
  onUnlike,
}: ItemCardLikeButtonProps) {
  return (
    <button
      type="button"
      onClick={onUnlike}
      // 판매완료 오버레이가 z-20이므로 하트는 그보다 위에서 클릭을 받을 수 있어야 합니다.
      className="absolute top-2 right-2 z-30 bg-white/80 hover:bg-white p-2 rounded-full shadow-sm transition-all"
      aria-label="찜 해제"
    >
      <Heart className="w-5 h-5 fill-red-500 text-red-500 transition-colors" />
    </button>
  );
}
