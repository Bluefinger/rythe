import { fromPromise } from "../../src/helpers";
import { isStream } from "../../src/stream";
import { CLOSED, PENDING } from "../../src/constants";
import { test } from "../testHarness";
import { delay } from "../testUtils";
import { getMockTimer } from "../testUtils";

test("fromPromise - should return a Stream that is waiting for the Promise to resolve", (assert) => {
  const p = delay(100);
  const s = fromPromise(p);
  assert.equal(isStream(s), true, "returns a valid Stream function");
  assert.equal(s.state, PENDING, "is set to PENDING state");
});

test("fromPromise - should return the resolved value and close once done", async (assert) => {
  const clock = getMockTimer();
  const s = fromPromise(delay(100, "foo"));
  assert.equal(s(), undefined, "has no initial value");
  await clock.flush();
  assert.equal(s(), "foo", "emits the value yielded by the Promise");
  assert.equal(
    s.state,
    CLOSED,
    "closes after emitting the value from the Promise"
  );
  clock.restore();
});

test("fromPromise - should close if the Promise rejects", async (assert) => {
  const clock = getMockTimer();
  const s = fromPromise(delay(100, "Error", true));
  await clock.flush();
  assert.equal(s(), undefined, "doesn't emit a value from a rejected Promise");
  assert.equal(s.state, CLOSED, "closes after a rejected Promise");
  clock.restore();
});
