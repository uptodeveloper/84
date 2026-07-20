"use server";

import { getCurrentUserId } from "@/features/auth/server-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product, ProductInsert, ProductStatus } from "@/types";
import { updateTag } from "next/cache";
import {
  getItemCategoryCacheTag,
  getItemCacheTag,
  ITEM_HOME_CACHE_TAG,
} from "./cache-tags";
import { assertCanMutateItem, ITEM_AUTH_ERROR_MESSAGES } from "./ownership";

type ItemCacheTarget = {
  id: string;
  category?: string | null;
  previousCategory?: string | null;
};

type ItemMutationInput = Pick<
  ProductInsert,
  "title" | "price" | "description" | "category" | "image"
>;

function validateItemMutationInput(input: ItemMutationInput): ItemMutationInput {
  // 서버 액션은 브라우저 UI를 거치지 않고도 호출될 수 있으므로 필수값을 서버에서도 확인합니다.
  if (
    !input.title.trim() ||
    !input.description.trim() ||
    !input.category.trim() ||
    !Number.isFinite(input.price) ||
    input.price < 0 ||
    (input.image !== null &&
      input.image !== undefined &&
      !input.image.every((url) => typeof url === "string"))
  ) {
    throw new Error("상품 정보를 확인해주세요.");
  }

  return {
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category.trim(),
  };
}

async function revalidateItemCaches(item?: ItemCacheTarget) {
  // 서버 액션 mutation 뒤에는 상세/홈/카테고리 캐시 태그를 같이 갱신합니다.
  // 외부에서 직접 호출하지 않고 권한 검증을 마친 mutation 내부에서만 실행합니다.
  if (item?.id) {
    updateTag(getItemCacheTag(item.id));
  }

  updateTag(ITEM_HOME_CACHE_TAG);

  if (item?.category) {
    updateTag(getItemCategoryCacheTag(item.category));
  }

  if (item?.previousCategory && item.previousCategory !== item.category) {
    updateTag(getItemCategoryCacheTag(item.previousCategory));
  }
}

async function getMutableItemOrThrow(itemId: string) {
  const supabase = await createSupabaseServerClient();

  // 권한 검증에는 클라이언트가 넘긴 sellerId를 믿지 않고 DB의 현재 seller_id를 다시 읽습니다.
  const { data: item, error } = await supabase
    .from("products")
    .select("id, seller_id, category")
    .eq("id", itemId)
    .maybeSingle();

  if (error) throw error;
  if (!item) throw new Error(ITEM_AUTH_ERROR_MESSAGES.NOT_FOUND);

  const userId = await getCurrentUserId();
  // 여기서부터 상품 변경 권한은 서버 쿠키에서 복원한 userId 기준으로만 판단합니다.
  assertCanMutateItem({ item, userId });

  return { supabase, item };
}

export async function createItemAction(
  input: ItemMutationInput,
): Promise<Product> {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error(ITEM_AUTH_ERROR_MESSAGES.UNAUTHENTICATED);
  }

  const supabase = await createSupabaseServerClient();
  const productInput = validateItemMutationInput(input);

  // seller_id는 클라이언트 입력을 받지 않고 서버 쿠키에서 확인한 사용자로 고정합니다.
  const { data: product, error } = await supabase
    .from("products")
    .insert({
      ...productInput,
      seller_id: userId,
      status: "FOR_SALE",
    })
    .select()
    .single();

  if (error) throw error;

  await revalidateItemCaches({
    id: product.id,
    category: product.category,
  });

  return product;
}

export async function updateItemAction({
  id,
  input,
}: {
  id: string;
  input: ItemMutationInput;
}): Promise<Product> {
  // DB의 seller_id와 서버 쿠키 userId를 비교한 뒤, 허용한 폼 필드만 수정합니다.
  const { supabase, item } = await getMutableItemOrThrow(id);
  const productInput = validateItemMutationInput(input);
  const { data: product, error } = await supabase
    .from("products")
    .update(productInput)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await revalidateItemCaches({
    id: product.id,
    category: product.category,
    previousCategory: item.category,
  });

  return product;
}

export async function deleteItemAction({ id }: { id: string }) {
  const { supabase, item } = await getMutableItemOrThrow(id);
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw error;

  await revalidateItemCaches({ id, category: item.category });
}

export async function updateItemStatusAction({
  id,
  status,
}: {
  id: string;
  status: ProductStatus;
}): Promise<Product> {
  const { supabase, item } = await getMutableItemOrThrow(id);
  const { data: product, error } = await supabase
    .from("products")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  await revalidateItemCaches({
    id: product.id,
    category: product.category,
    previousCategory: item.category,
  });

  return product;
}
