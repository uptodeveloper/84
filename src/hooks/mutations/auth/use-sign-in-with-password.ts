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
      // 잘못된 자격 증명은 예상 가능한 사용자 입력 오류이므로 개발 오류로 다시 출력하지 않습니다.
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
