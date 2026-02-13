import type { Database } from "./database.types";

export type chat_room_Entiniy =
  Database["public"]["Tables"]["chat_room"]["Row"];

export type useMutationCallback = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};
