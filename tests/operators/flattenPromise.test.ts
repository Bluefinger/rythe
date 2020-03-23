import { createStream, isStream } from "../../src/stream";
import { ACTIVE, PENDING } from "../../src/constants";
import { flattenPromise, map } from "../../src/operators";
import { test } from "../testHarness";
import { delay } from "../testUtils";
import { spy } from "sinon";
import { getMockTimer } from "../testUtils";

test("flattenPromise - returns a stream", (assert) => {
  const a = createStream(Promise.resolve(1));
  const b = flattenPromise(a);
  assert.equal(isStream(b), true, "produces a valid Stream function");
});

test("flattenPromise - flattens the stream to return a promise's value", async (assert) => {
  const clock = getMockTimer();
  const promise = delay(100, 1);
  const a = createStream(promise);
  const b = flattenPromise(a);
  assert.equal(
    b.state,
    PENDING,
    "received Promise doesn't update it to ACTIVE state, remains PENDING"
  );

  clock.runAll();
  const value = await promise;
  assert.equal(
    b.state,
    ACTIVE,
    "updates to ACTIVE state once Promise is resolved"
  );
  assert.equal(
    b(),
    value,
    "updates with the value yielded by the returned Promise"
  );

  clock.restore();
});

test("flattenPromise - is pipeable", async (assert) => {
  const clock = getMockTimer();
  const a = createStream<number>();
  const b = a.pipe(
    map((value) => delay(100, value)),
    flattenPromise,
    map((value) => value + 2)
  );
  a(5);
  await clock.flush();
  assert.equal(
    b(),
    7,
    "final dependent stream receives value from flattened Promise"
  );
  clock.restore();
});

test("flattenPromise - skips rejected promises", async (assert) => {
  const clock = getMockTimer();
  const a = createStream(delay(100, "Error", true));
  const b = flattenPromise(a);
  clock.runAll();
  try {
    await a();
  } catch (error) {
    assert.equal(
      b.state,
      PENDING,
      "remains in PENDING state after Promise is rejected"
    );
    assert.equal(
      b(),
      undefined,
      "doesn't update its value after Promise is rejected"
    );
  } finally {
    clock.restore();
  }
});

test("flattenPromise - allows an error handler to be used to catch errors", async (assert) => {
  const clock = getMockTimer();
  const handler = spy();
  const a = createStream(delay(100, "Error", true));
  flattenPromise(a, handler);
  clock.runAll();
  try {
    await a();
  } catch (error) {
    assert.equal(
      handler.calledWith(error),
      true,
      "handler function called when Promise is rejected"
    );
  } finally {
    clock.restore();
  }
});
