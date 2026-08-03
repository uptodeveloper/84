import assert from "node:assert/strict";
import test from "node:test";

import {
  removeLikedItem,
  restoreLikedItem,
} from "../src/features/my/liked-items.ts";

const firstItem = { id: "first" };
const secondItem = { id: "second" };
const thirdItem = { id: "third" };
const initialItems = [firstItem, secondItem, thirdItem];

test("removes an unliked product from the visible list", () => {
  assert.deepEqual(removeLikedItem(initialItems, secondItem.id), [
    firstItem,
    thirdItem,
  ]);
});

test("restores a product to its original position when unlike fails", () => {
  const removedItems = [firstItem, thirdItem];

  assert.deepEqual(
    restoreLikedItem(removedItems, secondItem, initialItems),
    initialItems,
  );
});

test("does not duplicate a product that is already visible", () => {
  assert.equal(
    restoreLikedItem(initialItems, secondItem, initialItems),
    initialItems,
  );
});
