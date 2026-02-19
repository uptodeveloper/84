import type { Database } from "./database.types";

export type chat_room_Entiniy =
  Database["public"]["Tables"]["chat_room"]["Row"];

export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

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
  seller_id: string | undefined;
  image?: string[]; //
}

export type Image = {
  file: File;
  previewUrl: string;
};

export interface ChatRoomParams {
  product_id: string;
  seller_id: string;
  buyer_id: string;
}

// 이미지 관리를 위한 타입 정의
export interface ImageItem {
  id: string; // 고유 ID (삭제 시 구별용)
  url: string; // 미리보기용 URL
  file?: File; // 새 파일이면 있고, 기존 이미지면 없음
}
