import assert from "node:assert/strict";
import test from "node:test";

import { getNextItemPageParam } from "../src/features/item/pagination.ts";

const makePage = (length) => Array.from({ length }, (_, index) => ({ id: index }));

test("continues from the server-rendered first page when client loading starts at page 1", () => {
  const firstClientPage = makePage(5);

  assert.equal(getNextItemPageParam(firstClientPage, [firstClientPage], 1), 2);
});

test("stops pagination when the last loaded page is shorter than the page size", () => {
  const partialPage = makePage(2);

  assert.equal(getNextItemPageParam(partialPage, [partialPage], 1), undefined);
});
