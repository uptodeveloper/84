import supabase from "@/lib/supabase";
import type { LikeEntity, LikeInsert, ToggleProductLikeInput } from "@/types";

export async function toggleProductLike({
  productId,
  userId,
  isLiked,
}: ToggleProductLikeInput): Promise<void> {
  if (isLiked) {
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) throw error;
  } else {
    const newLike: LikeInsert = { user_id: userId, product_id: productId };
    const { error } = await supabase.from("likes").insert(newLike);

    if (error) throw error;
  }
}

export async function getLikeStatus(
  productId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("likes")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .maybeSingle();

  if (error) throw error;
  return !!(data as LikeEntity | null);
}
