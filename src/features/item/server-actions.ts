"use server";

import { updateTag } from "next/cache";
import {
  createItem,
  deleteItem,
  updateItem,
  updateItemStatus,
} from "@/api/item";
import type {
  Product,
  ProductParams,
  ProductStatus,
  ProductUpdate,
} from "@/types";
import {
  getItemCategoryCacheTag,
  getItemCacheTag,
  ITEM_HOME_CACHE_TAG,
  ITEM_LIST_CACHE_TAG,
} from "./cache-tags";

type ItemCacheTarget = {
  id: string;
  category?: string | null;
};

function updateItemCaches(item?: ItemCacheTarget) {
  // 상품 변경은 상세 페이지와 홈/카테고리 목록 화면에 모두 영향을 준다.
  // 상세, 홈, 카테고리 태그를 나눠서 필요한 캐시만 갱신할 수 있게 한다.
  if (item?.id) {
    updateTag(getItemCacheTag(item.id));
  }

  updateTag(ITEM_LIST_CACHE_TAG);
  updateTag(ITEM_HOME_CACHE_TAG);

  if (item?.category) {
    updateTag(getItemCategoryCacheTag(item.category));
  }
}

export async function createItemAction(params: ProductParams): Promise<Product> {
  const product = await createItem(params);
  updateItemCaches(product);
  return product;
}

export async function updateItemAction(
  itemId: string,
  updates: ProductUpdate,
): Promise<Product> {
  const product = await updateItem(itemId, updates);
  updateItemCaches(product);
  return product;
}

export async function deleteItemAction(
  itemId: string,
  category?: string | null,
): Promise<void> {
  await deleteItem(itemId);
  updateItemCaches({ id: itemId, category });
}

export async function updateItemStatusAction(
  itemId: string,
  status: ProductStatus,
): Promise<Product> {
  const product = await updateItemStatus(itemId, status);
  updateItemCaches(product);
  return product;
}
