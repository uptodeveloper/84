"use client";

import type { Tables } from "@/database.types";
import ItemCard from "./item-card";
import ItemCardLikeButton from "./item-card-like-button";

interface InteractiveItemCardProps {
  item: Tables<"products">;
  userId?: string | null;
  showLikeButton?: boolean;
}

export default function InteractiveItemCard({
  item,
  userId = null,
  showLikeButton = false,
}: InteractiveItemCardProps) {
  return (
    <ItemCard
      item={item}
      action={
        showLikeButton ? (
          <ItemCardLikeButton productId={item.id} userId={userId} />
        ) : undefined
      }
    />
  );
}
