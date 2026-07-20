import assert from "node:assert/strict";
import test from "node:test";

import { appendMessageToCache } from "../src/features/chat/message-cache.ts";

function createMessage(id, createdAt) {
  return {
    id,
    content: id,
    created_at: createdAt,
    is_read: false,
    room_id: "room-1",
    sender_id: "user-1",
  };
}

test("appends and orders a Realtime message", () => {
  const later = createMessage("later", "2026-01-01T00:00:02.000Z");
  const earlier = createMessage("earlier", "2026-01-01T00:00:01.000Z");

  assert.deepEqual(appendMessageToCache([later], earlier), [earlier, later]);
});

test("deduplicates the server action result and Realtime event by id", () => {
  const message = createMessage("message-1", "2026-01-01T00:00:01.000Z");
  const current = [message];

  assert.equal(appendMessageToCache(current, message), current);
});
