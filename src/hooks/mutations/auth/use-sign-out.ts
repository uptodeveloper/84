import { signOut } from "@/api/auth";
import type { useMutationCallback } from "@/types";
import { useMutation } from "@tanstack/react-query";
import React from "react";

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
