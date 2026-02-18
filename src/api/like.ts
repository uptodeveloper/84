import supabase from "@/lib/supabase";

export async function toggleProductLike({
  productId,
  userId,
  isLiked, // 현재 찜 상태 (true면 삭제, false면 추가)
}: {
  productId: string;
  userId: string;
  isLiked: boolean;
}) {
  if (isLiked) {
    // 이미 찜했으면 -> 취소 (삭제)
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) throw error;
  } else {
    // 찜 안 했으면 -> 추가
    const { error } = await supabase
      .from("likes")
      .insert({ user_id: userId, product_id: productId });

    if (error) throw error;
  }
}

// (참고) 특정 상품의 찜 여부 확인용
export async function getLikeStatus(productId: string, userId: string) {
  const { data, error } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle(); // 있으면 객체, 없으면 null 반환

  if (error) throw error;
  return !!data; // 데이터가 있으면 true, 없으면 false
}
