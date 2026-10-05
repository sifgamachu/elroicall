import test from "node:test";
import assert from "node:assert/strict";
import {
  gentleAccountabilityMessage,
  isSnoozedToday,
  localDayKey,
} from "../src/lib/accountability.ts";

test("daily snooze is scoped to one local calendar date", () => {
  const day = new Date(2026, 9, 5, 21, 0, 0);
  const tomorrow = new Date(2026, 9, 6, 8, 0, 0);
  const settings = { snoozedDate: localDayKey(day) };
  assert.equal(isSnoozedToday(settings, day), true);
  assert.equal(isSnoozedToday(settings, tomorrow), false);
});

test("gentle check-ins repeat the user's intention without shame language", () => {
  const message = gentleAccountabilityMessage(
    "YouTube",
    52,
    45,
    "scripture_first"
  );
  const combined = `${message.title} ${message.body}`.toLowerCase();
  assert.match(combined, /scripture/);
  assert.match(combined, /youtube/);
  assert.match(combined, /45/);
  assert.doesNotMatch(combined, /failed|sinful|bad person|wasting your life|shame/);
});
