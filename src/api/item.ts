import supabase from "@/lib/supabase";
import type { ProductParams } from "@/types";
import { uploadImage } from "./image";

// -----------------------------------------------------------------------
// 1. [생성] 뼈대 생성 (이미지 없이 일단 만듦)
// -----------------------------------------------------------------------
export async function createItem({
  title,
  price,
  description,
  category,
  seller_id,
}: ProductParams) {
  const { data, error } = await supabase
    .from("products")
    .insert({
      title,
      price,
      description,
      category,
      seller_id: seller_id,
      status: "FOR_SALE",
      image: [],
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// -----------------------------------------------------------------------
// 2. [수정] 범용 업데이트 함수 (⭐ 리팩토링 핵심!)
// - 이제 이미지뿐만 아니라 제목, 가격 등 뭐든 수정 가능합니다.
// -----------------------------------------------------------------------
export async function updateItem(itemId: string, updates: any) {
  const { data, error } = await supabase
    .from("products")
    .update(updates) // { title: "새제목" } 또는 { image: [...] } 뭐든 들어감
    .eq("id", itemId)
    .select()
    .single();

  if (error) {
    console.error("업데이트 실패:", error);
    throw error;
  }
  return data;
}

// -----------------------------------------------------------------------
// 3. [복합] 생성 -> 업로드 -> 업데이트 (메인 함수)
// -----------------------------------------------------------------------
export async function createItemWithImages({
  title,
  price,
  description,
  category,
  images,
  seller_id,
}: ProductParams & { images: File[] }) {
  // 1. 아이템 먼저 생성
  const item = await createItem({
    title,
    price,
    description,
    category,
    seller_id,
  });

  if (!images || images.length === 0) return item;

  try {
    // 2. 이미지 업로드
    const uploadPromises = images.map((file) => {
      const fileExt = file.name.split(".").pop() || "webp";
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `${seller_id}/${item.id}/${fileName}`;
      return uploadImage({ file, filePath });
    });

    const imageUrls = await Promise.all(uploadPromises);

    // 3. DB 업데이트 (⭐ 위에서 만든 범용 updateItem 사용)
    // 기존 코드: updateItem({ id: item.id, image: imageUrls }) -> 에러 남
    // 수정 코드: 인자 순서에 맞춰 변경
    return await updateItem(item.id, { image: imageUrls });
  } catch (error) {
    console.error("이미지 업로드 실패, 롤백합니다.", error);
    await deleteItem(item.id);
    throw error;
  }
}

// -----------------------------------------------------------------------
// 4. [삭제]
// -----------------------------------------------------------------------
export async function deleteItem(id: string) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

// -----------------------------------------------------------------------
// 5. [조회] 상품 1개 상세 조회
// -----------------------------------------------------------------------
export async function getItem(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

// -----------------------------------------------------------------------
// 6. [조회] 전체 상품 리스트 (홈 화면용)
// -----------------------------------------------------------------------
export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

// -----------------------------------------------------------------------
// 7. [조회] 내 상품 리스트 (⭐ 마이페이지용 신규 추가!)
// -----------------------------------------------------------------------
export async function getMyProducts(userId: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", userId) // 판매자가 '나'인 것만 필터링
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
