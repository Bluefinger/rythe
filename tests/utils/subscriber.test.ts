import { fake } from "sinon";
import { createStream, sink } from "../../src/stream";
import { combine, map } from "../../src/operators";
import { emitEND } from "../../src/signal";
import { subscriber, subscribeEnd } from "../../src/utils/subscriber";
import { test } from "../testHarness";
import { CLOSED } from "../../src/constants";

test("subscriber - subscribes a stream with no parents", (assert) => {
  const a = createStream<number>();
  const b = createStream<string>();
  assert.equal(
    a.dependents.length,
    0,
    "Parent stream initially has no dependents"
  );
  assert.deepEqual(b.parents, [], "Dependent stream initially has no parents");
  subscriber<number, string>(b, a, (value: number) => String(value));
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
  const b = a.pipe(map((value) => String(value)));
  assert.deepEqual(
    b.parents,
    [a],
    "Dependent stream has the parent stream already linked"
  );
  subscriber(b, a.end, () => emitEND());
  assert.deepEqual(
    b.parents,
    [a, a.end],
    "Dependent stream has new parent listed"
  );
});

test("subscriber - subscribers a stream with many parents already", (assert) => {
  const a = createStream<number>();
  const b = createStream<number>();
  const c = combine((sA, sB) => sA() + sB(), a, b);
  assert.deepEqual(
    c.parents,
    [b, a],
    "Dependent stream has parent streams already linked"
  );
  subscriber(c, a.end, () => emitEND());
  assert.deepEqual(
    c.parents,
    [b, a, a.end],
    "Dependent stream has new parent appended to its list of parents"
  );
});

test("subscriber - closed dependent stream doesn't store parent reference", (assert) => {
  const a = createStream<number>();
  const b = createStream<number>();
  const subFn = (n: number) => n;
  b.end(true);

  subscriber(b, a, subFn);
  assert.deepEqual(
    a.dependents,
    [[b, subFn]],
    "Parent stream has reference to its dependent stream with subscription function"
  );
  assert.deepEqual(b.parents, [], "Dependent stream has no parent referenced");
});

test("subscribeEnd - link EndStreams together so when one stream closes, the other closes too", (assert) => {
  const a = createStream<number>();
  const b = createStream<number>();
  subscribeEnd(b.end, a.end);
  assert.deepEqual(
    a.end.dependents,
    [[sink, b.end]],
    "Parent EndStream has reference to dependent EndStream"
  );
  a.end(true);
  assert.equal(a.state, CLOSED, "Parent stream is now closed");
  assert.equal(b.state, CLOSED, "Dependent stream is closed by Parent stream");
  assert.equal(
    sink.val,
    undefined,
    "Sink does not update with the values that are passed to it"
  );
});

test("subscribeEnd - cleanupFn option executes when the streams close", (assert) => {
  const a = createStream<number>();
  const b = createStream<number>();
  const cleanup = fake();
  subscribeEnd(b.end, a.end, cleanup);
  a.end(true);
  assert.equal(
    cleanup.callCount,
    1,
    "cleanup function is executed when parent stream closes"
  );
});
