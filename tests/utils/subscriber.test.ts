import { createStream } from "../../src/stream";
import { combine, map } from "../../src/operators";
import { END } from "../../src/signal";
import { subscriber } from "../../src/utils/subscriber";
import { test } from "../testHarness";

test("subscriber - subscribes a stream with no parents", (assert) => {
  const a = createStream<number>();
  const b = createStream<string>();
  assert.equal(
    a.dependents.length,
    0,
    "Parent stream initially has no dependents"
  );
  assert.deepEqual(b.parents, [], "Dependent stream initially has no parents");
  subscriber<number, string>(b, a, (value: number) => value + "");
  assert.equal(
    a.dependents.length,
    1,
    "Parent stream has dependents after subscribing"
  );
  assert.deepEqual(
    b.parents,
    [a],
    "Dependent stream has the parent stream listed"
  );
});

test("subscriber - subscribes a stream with one parent already", (assert) => {
  const a = createStream<number>();
  const b = a.pipe(map((value) => value + ""));
  assert.deepEqual(
    b.parents,
    [a],
    "Dependent stream has the parent stream already linked"
  );
  subscriber(b, a.end, () => END);
  assert.deepEqual(
    b.parents,
    [a, a.end],
    "Dependent stream has new parent listed"
  );
});

test("subscriber = subscribers a stream with many parents already", (assert) => {
  const a = createStream<number>();
  const b = createStream<number>();
  const c = combine((sA, sB) => sA() + sB(), a, b);
  assert.deepEqual(
    c.parents,
    [b, a],
    "Dependent stream has parent streams already linked"
  );
  subscriber(c, a.end, () => END);
  assert.deepEqual(
    c.parents,
    [b, a, a.end],
    "Dependent stream has new parent appended to its list of parents"
  );
});
