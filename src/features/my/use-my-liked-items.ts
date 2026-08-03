"use client";

import { toggleProductLike } from "@/api/like";
import type { Product } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { removeLikedItem, restoreLikedItem } from "./liked-items";

export function useMyLikedItems(userId: string, initialItems: Product[]) {
  const queryClient = useQueryClient();
  const [likedItems, setLikedItems] = useState(initialItems);

  const { mutate: unlikeItem } = useMutation({
    // 별도 offline queue UX가 없으므로 연결이 끊기면 대기시키지 않고 실패 처리해 목록을 복구합니다.
    networkMode: "always",
    mutationFn: (item: Product) =>
      toggleProductLike({
        productId: item.id,
        userId,
        isLiked: true,
      }),

    onMutate: async (item) => {
      const queryKey = ["like", item.id, userId] as const;
      await queryClient.cancelQueries({ queryKey });

      const previousLike =
        queryClient.getQueryData<boolean>(queryKey) ?? true;

      // mutation을 부모 hook이 소유하므로 카드를 먼저 제거해도 실패 callback이 사라지지 않습니다.
      queryClient.setQueryData(queryKey, false);
      setLikedItems((currentItems) =>
        removeLikedItem(currentItems, item.id),
      );

      return { previousLike };
    },

    onError: (_error, item, context) => {
      const queryKey = ["like", item.id, userId] as const;

      queryClient.setQueryData(queryKey, context?.previousLike ?? true);
      setLikedItems((currentItems) =>
        restoreLikedItem(currentItems, item, initialItems),
      );

      toast.error("찜 해제에 실패했습니다. 다시 시도해주세요.");
    },

    onSettled: (_data, _error, item) => {
      queryClient.invalidateQueries({
        queryKey: ["like", item.id, userId],
      });
    },
  });

  return { likedItems, unlikeItem };
}
