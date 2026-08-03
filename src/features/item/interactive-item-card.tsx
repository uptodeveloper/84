"use client";

import type { Tables } from "@/database.types";
import ItemCard from "./item-card";
import ItemCardLikeButton from "./item-card-like-button";

interface InteractiveItemCardProps {
  item: Tables<"products">;
  showLikeButton?: boolean;
  onUnlike?: () => void;
}

export default function InteractiveItemCard({
  item,
  showLikeButton = false,
  onUnlike,
}: InteractiveItemCardProps) {
  return (
    <ItemCard
      item={item}
      action={
        showLikeButton ? (
          // 실제 mutation은 목록을 소유한 MyShop 쪽 hook이 처리하고 카드는 클릭만 전달합니다.
          <ItemCardLikeButton onUnlike={onUnlike} />
        ) : undefined
      }
    />
  );
}
