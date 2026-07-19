import assert from "node:assert/strict";
import test from "node:test";

import {
  assertCanMutateItem,
  ITEM_AUTH_ERROR_MESSAGES,
} from "../src/features/item/ownership.ts";

test("allows the seller to mutate their own item", () => {
  assert.doesNotThrow(() => {
    assertCanMutateItem({
      item: { seller_id: "seller-1" },
      userId: "seller-1",
    });
  });
});

test("rejects item mutation when the user is not authenticated", () => {
  assert.throws(
    () => {
      assertCanMutateItem({
        item: { seller_id: "seller-1" },
        userId: null,
      });
    },
    {
      message: ITEM_AUTH_ERROR_MESSAGES.UNAUTHENTICATED,
    },
  );
});

test("rejects item mutation when the signed-in user is not the seller", () => {
  assert.throws(
    () => {
      assertCanMutateItem({
        item: { seller_id: "seller-1" },
        userId: "buyer-1",
      });
    },
    {
      message: ITEM_AUTH_ERROR_MESSAGES.FORBIDDEN,
    },
  );
});
