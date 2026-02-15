import type { Database } from "./database.types";

export type chat_room_Entiniy =
  Database["public"]["Tables"]["chat_room"]["Row"];

export type useMutationCallback = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};

export interface ProductParams {
  title: string;
  price: number;
  description: string;
  category: string;
  user_id: string | undefined;
}

export type Image = {
  file: File;
  previewUrl: string;
};

// export type images = {
//   images: File[];
//   user_id: string | undefined;
// };
