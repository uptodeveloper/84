import { signUp } from "@/api/auth";
import { viewerQueryKey } from "@/features/auth/use-viewer";
import type { useMutationCallback } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSignUp(callbacks?: useMutationCallback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: viewerQueryKey });
      callbacks?.onSuccess?.();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
