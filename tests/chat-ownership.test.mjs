import assert from "node:assert/strict";
import test from "node:test";

import {
  assertCanStartChat,
  assertChatParticipant,
  CHAT_AUTH_ERROR_MESSAGES,
  isChatParticipant,
} from "../src/features/chat/ownership.ts";

const room = {
  id: "room-1",
  buyer_id: "buyer-1",
  seller_id: "seller-1",
};

test("allows both chat room participants", () => {
  assert.equal(isChatParticipant({ room, userId: "buyer-1" }), true);
  assert.equal(isChatParticipant({ room, userId: "seller-1" }), true);
});

test("rejects users who are not chat room participants", () => {
  assert.throws(
    () => assertChatParticipant({ room, userId: "other-1" }),
    { message: CHAT_AUTH_ERROR_MESSAGES.FORBIDDEN },
  );
});

test("rejects starting a chat with the user's own product", () => {
  assert.throws(
    () => assertCanStartChat({ sellerId: "user-1", userId: "user-1" }),
    { message: CHAT_AUTH_ERROR_MESSAGES.OWN_PRODUCT },
  );
});
