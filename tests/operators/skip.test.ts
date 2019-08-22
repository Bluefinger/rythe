import { createStream, isStream } from "../../src/stream";
import { skip, map } from "../../src/operators";
import { test } from "../testHarness";

test("skip - skips the provided amount of times", assert => {
  const a = createStream<number>();
  const s = a.pipe(skip(3));
  const m = s.pipe(map(value => value + 1));
  assert.equal(isStream(s), true, "returns a valid Stream function");
  a(1)(2)(3);
  assert.equal(s(), undefined, "skip ignores first three updates");
  assert.equal(
    m(),
    undefined,
    "dependent stream receives no updates from skip"
  );
  a(4);
  assert.equal(s(), 4, "skip no longer ignores updates");
  assert.equal(m(), 5, "dependent stream received an updated from skip");
});
