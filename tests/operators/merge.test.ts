import { createStream, isStream } from "../../src/stream";
import { merge } from "../../src/operators";
import { Stream } from "../../src/types/stream";
import { ACTIVE, CLOSED } from "../../src/constants";
import { test } from "../testHarness";

test("merge - combines many streams into a single stream", (assert) => {
  const a = createStream<number>();
  const b = createStream<string>();
  const c = createStream<boolean>();
  const m = merge(a, b, c);
  assert.equal(isStream(m), true, "returns a valid Stream function");
  a(5);
  assert.equal(m(), a(), "merged Stream returns same value from first source");
  b("6");
  assert.equal(m(), b(), "merged Stream returns same value from second source");
  c(true);
  assert.equal(m(), c(), "merged Stream returns same value from third source");
});

test("merge - immediately returns the newest active parent stream", (assert) => {
  const a = createStream<number>();
  const b = createStream<string>("4");
  const c = createStream<boolean>();
  const m = merge(a, b, c);
  assert.equal(
    m(),
    b(),
    "merged Stream returns the same value as the only active source"
  );
});

test("merge - errors if a non-stream source is provided", (assert) => {
  const a = createStream<number>();
  const b = (() => true) as Stream<boolean>;
  assert.throws(
    () => merge(a, b),
    "throws error when one or all inputs are not valid Stream functions"
  );
});

test("merge - closes when any of its parent streams ends", (assert) => {
  const a = createStream<number>();
  const b = createStream<string>("5");
  const m = merge(a, b);
  assert.equal(m.state, ACTIVE, "initial merge stream state is ACTIVE");
  a.end(true);
  assert.equal(a.state, CLOSED, "first source stream state is CLOSED");
  assert.equal(b.state, ACTIVE, "second source stream state is ACTIVE");
  assert.equal(
    m.state,
    CLOSED,
    "merge stream state is CLOSED because of first source stream"
  );
});
