import assert from "node:assert/strict";
import { test } from "node:test";
import { dsq40 } from "../data/defense-dsq";
import { createInstrumentSession, instrumentResponses, parseInstrumentSession } from "../lib/session";

test("empty and partial sessions round-trip, including the lowest and highest options", () => {
  const empty = createInstrumentSession(dsq40);
  assert.deepEqual(parseInstrumentSession(JSON.stringify(empty), dsq40), empty);
  const partial = { ...empty, answers: { [dsq40.items[0].id]: 0, [dsq40.items[1].id]: 8 }, currentQuestionIndex: 2 };
  assert.deepEqual(parseInstrumentSession(JSON.stringify(partial), dsq40), partial);
  assert.equal(instrumentResponses(dsq40, partial).length, 2);
});

test("corrupted, old-version, unknown-ID and out-of-range stored data is rejected", () => {
  const session = createInstrumentSession(dsq40);
  for (const raw of ["{", "null", "[]", JSON.stringify({ ...session, questionnaireVersion: "old" }),
    JSON.stringify({ ...session, answers: { unknown: 2 } }), JSON.stringify({ ...session, answers: { [dsq40.items[0].id]: 9 } }),
    JSON.stringify({ ...session, currentQuestionIndex: 40 }), JSON.stringify({ ...session, completed: true })]) {
    assert.equal(parseInstrumentSession(raw, dsq40), null);
  }
});
