import supabase from "@/lib/supabase";

import type { ProductParams } from "@/types"; // 타입 경로 확인
import { uploadImage } from "./image";

// 1. 뼈대 생성 (이미지 없이 일단 만듦)
export async function createItem({
  title,
  price,
  description,
  category,
  user_id,
}: ProductParams) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      title,
      price,
      description,
      category,
      seller_id: user_id,
      status: "FOR_SALE",
      image: [], // 일단 빈 배열로 시작!
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 2. 메인 함수 (생성 -> 업로드 -> 업데이트)
export async function createItemWithImages({
  title,
  price,
  description,
  category,
  images, // File[]
  user_id,
}: ProductParams & { images: File[] }) {
  // 1. 아이템 먼저 생성 (자리 맡기)
  const item = await createItem({
    title,
    price,
    description,
    category,
    user_id,
  });

  if (!images || images.length === 0) return item;

  try {
    // 2. 이미지 업로드 (병렬 처리)
    const uploadPromises = images.map((file) => {
      const fileExt = file.name.split(".").pop() || "webp";
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;

      // 🚨 중요: SQL 정책이 [user_id] 폴더를 요구함!
      const filePath = `${user_id}/${item.id}/${fileName}`;

      return uploadImage({ file, filePath });
    });

    const imageUrls = await Promise.all(uploadPromises);

    // 3. DB에 이미지 주소 업데이트
    return await updateItem({
      id: item.id,
      image: imageUrls, // 컬럼명 확인 (image vs image_urls)
    });
  } catch (error) {
    console.error("이미지 업로드 실패, 롤백합니다.", error);
    await deleteItem(item.id); // 롤백: 실패하면 DB 데이터 삭제
    throw error;
  }
}

// 3. 업데이트 함수
export async function updateItem({
  id,
  image,
}: {
  id: string;
  image: string[];
}) {
  const { data, error } = await supabase
    .from("products")
    .update({ image }) // 이미지 컬럼 업데이트
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// 4. 삭제 함수 (롤백용)
export async function deleteItem(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// 상품 1개 가져오기 (Read)
export async function getItem(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*") // 모든 컬럼 다 가져와
    .eq("id", id) // 내 ID랑 똑같은 놈만
    .single(); // 하나만 가져와

  if (error) throw error;
  return data;
}


// 전체 상품 리스트 가져오기 (최신순)
export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false }); // 최신 등록순 정렬

  if (error) throw error;
  return data;
}