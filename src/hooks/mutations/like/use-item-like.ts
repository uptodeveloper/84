import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLikeStatus, toggleProductLike } from "@/api/like";

export function useProductLike(productId: string, userId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ["like", productId, userId];

  // 1. 현재 찜 상태 조회
  const { data: isLiked = false } = useQuery({
    queryKey,
    queryFn: () => getLikeStatus(productId, userId!),
    enabled: !!userId, // 로그인했을 때만 조회
  });

  // 2. 찜 토글 뮤테이션 (낙관적 업데이트 포함)
  const { mutate: toggleLike } = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error("로그인이 필요합니다.");
      // 현재 상태(isLiked)를 반대로 뒤집어서 요청
      return toggleProductLike({ productId, userId, isLiked });
    },

    // ⭐ 낙관적 업데이트 시작
    onMutate: async () => {
      // A. 진행 중인 쿼리 취소 (충돌 방지)
      await queryClient.cancelQueries({ queryKey });

      // B. 이전 상태 백업 (에러 나면 롤백용)
      const previousLike = queryClient.getQueryData<boolean>(queryKey);

      // C. 가짜 데이터로 UI 즉시 업데이트! (true <-> false 뒤집기)
      queryClient.setQueryData(queryKey, (old: boolean) => !old);

      // D. 컨텍스트 반환 (onError에서 사용)
      return { previousLike };
    },

    // 에러 발생 시 롤백
    onError: (err, _variables, context) => {
      if (context?.previousLike !== undefined) {
        queryClient.setQueryData(queryKey, context.previousLike);
      }
      console.error("찜하기 실패:", err);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    },

    // 성공하든 실패하든 최신 상태 동기화
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return { isLiked, toggleLike };
}
