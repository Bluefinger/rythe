import { createStream } from "../../src/stream";
import { dropRepeats, map } from "../../src/operators";
import { test } from "../testHarness";
import { spy } from "sinon";

test("dropRepeats - will not pass down repeat values (strict equality ===)", (assert) => {
  const a = createStream<number | string>();
  const mapFn = spy((n: number | string) => n);
  const m = a.pipe(dropRepeats, map(mapFn));
  a(1)(1)(2)(2)("2")(3);
  assert.equal(m(), 3, "dependent stream receives the correct value");
  assert.equal(
    mapFn.callCount,
    4,
    "dependent stream updated on every non-repeating value"
  );
});

test("dropRepeats - passes down initial value immediately", (assert) => {
  const a = createStream<number>(1);
  const mapFn = spy((n: number) => n);
  const m = a.pipe(dropRepeats, map(mapFn));
  assert.equal(m(), 1, "dependent stream receives the correct initial value");
});

test("dropRepeats - doesn't push values down after .end is invoked", (assert) => {
  const a = createStream<number>();
  const dr = dropRepeats(a);
  const mapFn = spy((n: number) => n);
  const m = map(mapFn)(dr);
  assert.deepEqual(
    dr.parents,
    [a],
    "dropRepeats is subscribed to a parent stream"
  );
  a(1)(3);
  dr.end(true);
  a(3)(3)(1);
  assert.equal(m(), 3, "dependent stream does not receive any more values");
  assert.equal(
    mapFn.callCount,
    2,
    "dependent stream was not called any more times after dropRepeats was ended"
  );
  assert.deepEqual(
    dr.parents,
    [],
    "dropRepeats is no longer subscribed to a parent stream"
  );
});

test("dropRepeats - prevents undefined/null repeat values", (assert) => {
  const a = createStream<number | null | undefined>();
  const dr = dropRepeats(a);
  const mapFn = spy((n: number | null | undefined) => n);
  const m = map(mapFn)(dr);
  a(3)(null)(null)(undefined)(undefined)(null);
  assert.equal(
    m(),
    null,
    "dependent stream receives the correct nullable value"
  );
  assert.equal(
    mapFn.callCount,
    4,
    "dependent stream updated on every non-repeating nullable value"
  );
});
