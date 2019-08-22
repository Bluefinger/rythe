import { createStream, isStream } from "../../src/stream";
import { take, map } from "../../src/operators";
import { CLOSED } from "../../src/constants";
import { test } from "../testHarness";

test("take - takes the specified amount of updates and then ends", assert => {
  const a = createStream<number>();
  const t = a.pipe(take(3));
  const m = t.pipe(map(value => value + 1));
  assert.equal(isStream(t), true, "returns a valid Stream function");
  a(1)(2)(3);
  assert.equal(t(), 3, "take accepts first three updates");
  assert.equal(m(), 4, "dependent stream receives updates from take");
  a(4);
  assert.equal(t(), 3, "take ignores further updates");
  assert.equal(m(), 4, "dependent stream receives no more updates from take");
  assert.equal(
    t.state,
    CLOSED,
    "take is now CLOSED after taking specified amount of updates"
  );
});
