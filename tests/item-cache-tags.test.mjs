import assert from "node:assert/strict";
import test from "node:test";

import {
  getItemCategoryCacheTag,
  getItemDetailCacheTags,
  getItemHomeCacheTags,
  getItemCacheTag,
  ITEM_HOME_CACHE_TAG,
  ITEM_LIST_CACHE_TAG,
} from "../src/features/item/cache-tags.ts";

test("builds a stable cache tag for an item detail", () => {
  assert.equal(getItemCacheTag("item-123"), "item:item-123");
});

test("exposes the shared item list cache tag", () => {
  assert.equal(ITEM_LIST_CACHE_TAG, "items");
});

test("exposes the shared home list cache tag", () => {
  assert.equal(ITEM_HOME_CACHE_TAG, "items:home");
});

test("keeps item detail cache tags scoped to one item", () => {
  assert.deepEqual(getItemDetailCacheTags("item-123"), ["item:item-123"]);
});

test("builds cache tags for the default home list", () => {
  assert.deepEqual(getItemHomeCacheTags(), ["items", "items:home"]);
});

test("builds cache tags for category lists", () => {
  assert.deepEqual(getItemHomeCacheTags("전자기기"), [
    "items",
    "items:category:전자기기",
  ]);
  assert.equal(getItemCategoryCacheTag("전자기기"), "items:category:전자기기");
});
