import { signOut } from "@/api/auth";
import type { useMutationCallback } from "@/types";
import { useMutation } from "@tanstack/react-query";

export default function UseSignOut(callbakcs?: useMutationCallback) {
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      callbakcs?.onSuccess?.();
    },
    onError: (error) => {
      callbakcs?.onError?.(error as Error);
    },
    onSettled: () => {
      callbakcs?.onSettled?.();
    },
  });
}
