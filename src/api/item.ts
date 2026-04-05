import supabase from "@/lib/supabase";
import type {
  Product,
  ProductListParams,
  ProductParams,
  ProductStatus,
  ProductUpdate,
} from "@/types";
import { uploadImage } from "./image";

type LikedProductRow = {
  product_id: string;
  products: Product | null;
};

export async function createItem({
  title,
  price,
  description,
  category,
  seller_id,
  image,
}: ProductParams): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      title,
      price,
      description,
      category,
      seller_id,
      status: "FOR_SALE",
      image,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateItem(
  itemId: string,
  updates: ProductUpdate,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", itemId)
    .select()
    .single();

  if (error) {
    console.error("업데이트 실패:", error);
    throw error;
  }
  return data;
}

export async function createItemWithImages({
  title,
  price,
  description,
  category,
  images,
  seller_id,
}: ProductParams & { images: File[] }): Promise<Product> {
  const item = await createItem({
    title,
    price,
    description,
    category,
    seller_id,
  });

  if (!images || images.length === 0) return item;

  try {
    const uploadPromises = images.map((file) => {
      const fileExt = file.name.split(".").pop() || "webp";
      const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const filePath = `${seller_id}/${item.id}/${fileName}`;
      return uploadImage({ file, filePath });
    });

    const imageUrls = await Promise.all(uploadPromises);
    return await updateItem(item.id, { image: imageUrls });
  } catch (error) {
    console.error("이미지 업로드 실패, 롤백합니다.", error);
    await deleteItem(item.id);
    throw error;
  }
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function getItem(id: string): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

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

export async function getMyProducts(userId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("seller_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getLikedProducts(userId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("likes")
    .select(
      `
      product_id,
      products (*)
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data as LikedProductRow[])
    .map((item) => item.products)
    .filter((product): product is Product => product !== null);
}

export async function updateItemStatus(
  itemId: string,
  status: ProductStatus,
): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", itemId)
    .select()
    .single();

  if (!data) {
    console.warn("업데이트된 값이 없습니다. RLS 권한을 확인해주세요.");
    throw error;
  }

  return data;
}
