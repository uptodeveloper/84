import type { Tables, TablesInsert, TablesUpdate } from "./database.types";

export type ChatRoomEntity = Tables<"chat_room">;
export type ChatRoomInsert = TablesInsert<"chat_room">;
export type MessageEntity = Tables<"messages">;
export type MessageInsert = TablesInsert<"messages">;
export type Product = Tables<"products">;
export type ProductInsert = TablesInsert<"products">;
export type ProductUpdate = TablesUpdate<"products">;
export type LikeEntity = Tables<"likes">;
export type LikeInsert = TablesInsert<"likes">;
export type ProductStatus = NonNullable<Product["status"]>;

export type useMutationCallback = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};

export type ProductParams = Omit<ProductInsert, "id" | "created_at">;

export type ProductListParams = {
  term?: string;
  category?: string;
  from: number;
  to: number;
};

export type ChatRoomParams = Pick<
  ChatRoomInsert,
  "product_id" | "seller_id" | "buyer_id"
> & {
  product_id: string;
  seller_id: string;
  buyer_id: string;
};

export type SendMessageInput = Pick<
  MessageInsert,
  "room_id" | "sender_id" | "content"
>;

export type ToggleProductLikeInput = {
  productId: string;
  userId: string;
  isLiked: boolean;
};

export type Image = {
  file: File;
  previewUrl: string;
};

export interface ImageItem {
  id: string;
  url: string;
  file?: File;
}
