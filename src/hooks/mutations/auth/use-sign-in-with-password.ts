import { signInWithPassword } from "@/api/auth";
import { viewerQueryKey } from "@/features/auth/use-viewer";
import type { useMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSignInWithPassword(callbacks?: useMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signInWithPassword,
    onSuccess: () => {
      // 로그아웃 상태로 캐시된 viewer가 홈 이동 뒤 재사용되지 않도록 제거합니다.
      queryClient.removeQueries({ queryKey: viewerQueryKey });
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      console.error(error);

      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
