import assert from "node:assert/strict";
import test from "node:test";

import { chatQueryKeys } from "../src/features/chat/query-keys.ts";

test("scopes the chat room cache to the authenticated user", () => {
  assert.deepEqual(chatQueryKeys.rooms("user-1"), [
    "chat",
    "rooms",
    "user-1",
  ]);
});

test("scopes the message cache to both user and room", () => {
  assert.deepEqual(chatQueryKeys.messages("user-1", "room-1"), [
    "chat",
    "messages",
    "user-1",
    "room-1",
  ]);
});
