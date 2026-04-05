import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLikeStatus, toggleProductLike } from "@/api/like";

export function useProductLike(productId: string, userId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ["like", productId, userId] as const;

  const { data: isLiked = false } = useQuery({
    queryKey,
    queryFn: () => getLikeStatus(productId, userId!),
    enabled: !!userId,
  });

  const { mutate: toggleLike } = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("로그인이 필요합니다.");
      return toggleProductLike({ productId, userId, isLiked });
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousLike = queryClient.getQueryData<boolean>(queryKey);
      queryClient.setQueryData<boolean>(queryKey, (old) => !old);

      return { previousLike };
    },

    onError: (err, _variables, context) => {
      if (context?.previousLike !== undefined) {
        queryClient.setQueryData(queryKey, context.previousLike);
      }
      console.error("좋아요 처리 실패:", err);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { isLiked, toggleLike };
}
