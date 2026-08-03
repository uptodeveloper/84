import supabase from "@/lib/supabase";
import type { Product, ProductListParams } from "@/types";

export async function getProducts({
  term,
  category,
  from,
  to,
}: ProductListParams): Promise<Product[]> {
  let query = supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (term) {
    query = query.ilike("title", `%${term}%`);
  }

  if (category && category !== "전체") {
    query = query.eq("category", category);
  }

  const { data, error } = await query.range(from, to);

  if (error) throw error;
  return data;
}
