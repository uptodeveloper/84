import { signInWithOAuth } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";

export function useSignInwithOAuth() {
  return useMutation({
    mutationFn: signInWithOAuth,
  });
}
