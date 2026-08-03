import { signInWithOAuth } from "@/api/auth";
import type { useMutationCallback } from "@/types";
import { useMutation } from "@tanstack/react-query";

export function useSignInWithOAuth(callbacks?: useMutationCallback) {
  return useMutation({
    mutationFn: signInWithOAuth,
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
