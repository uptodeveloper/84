import { signOut } from "@/api/auth";
import { viewerQueryKey, type Viewer } from "@/features/auth/use-viewer";
import type { useMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSignOut(callbacks?: useMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      // 계정별 query를 모두 비운 뒤 viewer를 비로그인 상태로 고정해 이전 사용자의 데이터가 남지 않게 합니다.
      queryClient.removeQueries();
      queryClient.setQueryData<Viewer>(viewerQueryKey, { userId: null });
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      callbacks?.onError?.(error as Error);
    },
    onSettled: () => {
      callbacks?.onSettled?.();
    },
  });
}
