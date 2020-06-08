import { createStream, isStream, map, pipe } from "../../src";
import { test } from "../testHarness";

test("pipe - should throw an error if no functions are piped", (assert) => {
  assert.throws(
    () => pipe(),
    "pipe throws if called with no functions passed as parameters"
  );
});

test("pipe - should accept any pipeable operators", (assert) => {
  const piped = pipe(map((n: number) => n + 1));
  assert.equal(typeof piped, "function", "pipe should return a function");
});

test("pipe - should apply piped functions to Streams and return a new Stream", (assert) => {
  const piped = pipe(
    map<number>((n) => n + 1),
    map((n) => n.toString(16)),
    map((s) => s + "b")
  );
  const a = createStream<number>();
  const b = piped(a);
  assert.notEqual(
    a,
    b,
    "Resultant Stream is not the same as the original Stream"
  );
  assert.equal(
    isStream(b),
    true,
    "Resultant Stream is a valid Stream function"
  );
  a(9);
  assert.equal(
    b(),
    "ab",
    "Resultant Stream should update correctly with defined value format"
  );
});
