import type { Tables, TablesInsert } from "./database.types";

export type ChatRoomEntity = Tables<"chat_room">;
export type MessageEntity = Tables<"messages">;
export type Product = Tables<"products">;
export type ProductInsert = TablesInsert<"products">;
export type LikeEntity = Tables<"likes">;
export type LikeInsert = TablesInsert<"likes">;
export type ProductStatus = NonNullable<Product["status"]>;

export type useMutationCallback = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};

export type ProductListParams = {
  term?: string;
  category?: string;
  from: number;
  to: number;
};

export type ToggleProductLikeInput = {
  productId: string;
  userId: string;
  isLiked: boolean;
};

export interface ImageItem {
  id: string;
  url: string;
  file?: File;
}
