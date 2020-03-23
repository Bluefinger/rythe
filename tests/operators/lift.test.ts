import { lift } from "../../src/operators";
import { createStream, isStream } from "../../src/stream";
import { test } from "../testHarness";

test("lift - unwraps all its source Streams and provides their values as parameters", (assert) => {
  const a = createStream<number>(5);
  const b = createStream<string>("5");
  const c = lift((...args) => args, a, b);
  assert.equal(isStream(c), true, "is a valid Stream function");
  assert.deepEqual(
    c(),
    [5, "5"],
    "unwraps parameter values from their source Streams"
  );
});
