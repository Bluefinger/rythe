import { createStream, isStream } from "../../src/stream";
import { scanMerge, map } from "../../src/operators";
import { Stream } from "../../src/types/stream";
import { ACTIVE, CLOSED } from "../../src/constants";
import { test } from "../testHarness";

test("scanMerge - accumulates many streams into a single stream", (assert) => {
  const add = createStream<number>();
  const sub = createStream<number>();
  const m = scanMerge(
    1,
    [add, (acc, val) => acc + val],
    [sub, (acc, val) => acc - val]
  );
  const v = m.pipe(map((val) => val + ""));
  assert.equal(isStream(v), true, "returns a valid Stream function");
  assert.equal(m(), 1, "scanMerge has an initial value");
  add(5);
  assert.equal(
    m(),
    6,
    "scanMerge accumulates according to function subscribed for first stream"
  );
  sub(3);
  assert.equal(
    m(),
    3,
    "scanMerge accumulates according to function subscribed for second stream"
  );
});

test("scanMerge - doesn't immediately accumulate all active parent streams, only returns initial value", (assert) => {
  const add = createStream<number>(4);
  const sub = createStream<number>(1);
  const m = scanMerge(
    0,
    [add, (acc, val) => acc + val],
    [sub, (acc, val) => acc - val]
  );
  assert.equal(
    m(),
    0,
    "returns it's own initial value first instead of accumulating source stream values"
  );
});

test("scanMerge - errors if a non-stream source is provided", (assert) => {
  const add = createStream<number>();
  const sub = (() => 10) as Stream<number>;
  assert.throws(
    () =>
      scanMerge(
        0,
        [add, (acc, val) => acc + val],
        [sub, (acc, val) => acc - val]
      ),
    "throws error if it receives an invalid function as stream"
  );
});

test("scanMerge - closes when any of its parent streams end", (assert) => {
  const add = createStream<number>(4);
  const sub = createStream<number>(1);
  const m = scanMerge(
    0,
    [add, (acc, val) => acc + val],
    [sub, (acc, val) => acc - val]
  );
  sub(1);
  assert.equal(m.state, ACTIVE, "scanMerge is initially ACTIVE");
  add.end(true);
  assert.equal(add.state, CLOSED, "first source stream is CLOSED");
  assert.equal(sub.state, ACTIVE, "second source stream is ACTIVE");
  assert.equal(
    m.state,
    CLOSED,
    "scanMerge is now CLOSED because of the first source stream"
  );
});
