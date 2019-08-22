import { createStream } from "../../src/stream";
import { ACTIVE, CLOSED } from "../../src/constants";
import { map } from "../../src/operators";
import { END, SKIP } from "../../src/signal";
import { Stream } from "../../src/types";
import { test } from "../testHarness";
import { spy } from "sinon";

test("map - transforms values it receives", assert => {
  const a = createStream<number | null>();
  const b = a.pipe(map<number>(value => value || 0));
  a(5);
  assert.equal(a(), 5, "first stream updates with a value and emits it");
  assert.equal(b(), 5, "dependent stream updates with emitted value");
  a(null);
  assert.equal(a(), null, "first stream updates with new value and emits it");
  assert.equal(b(), 0, "dependent stream maps emitted value to a new value");
});

test("map - transforms initial values", assert => {
  const a = createStream<number | null>(5);
  const mapFn = spy((value: number | null) => value || 0);
  const b = a.pipe(map<number>(mapFn));
  assert.equal(
    b(),
    5,
    "dependent stream updates immediately with parent stream's initial value"
  );
  assert.equal(mapFn.callCount, 1);
});

test("map - can ignore the initial value", assert => {
  const a = createStream<number | null>(5);
  const mapFn = spy((value: number | null) => value || 0);
  const b = a.pipe(map<number>(mapFn, SKIP));
  assert.equal(
    b(),
    undefined,
    "dependent stream not updated with initial value"
  );
  assert.equal(
    mapFn.callCount,
    0,
    "map function not called when initial values are ignored"
  );
});

test("map - can be interrupted with SKIP signal", assert => {
  const a = createStream<number>();
  const mapFn = spy((n: number) => (n === 5 ? SKIP : n));
  const b = a.pipe(map<number>(mapFn));
  a(2)(3)(SKIP)(5);
  assert.equal(a(), 5, "final update on parent stream is correct");
  assert.equal(
    b(),
    3,
    "dependent stream contains last value before skipping further updates"
  );
  assert.equal(
    mapFn.callCount,
    3,
    "map function called 3 times on updates that it doesn't skip"
  );
});

test("map - can be ended with .end", assert => {
  const a = createStream<number>(2);
  const mapFn = spy((n: number) => (n === 5 ? SKIP : n));
  const b = a.pipe(map<number>(mapFn));
  assert.deepEqual(b.parents, [a], "dependent stream lists the correct parent");
  assert.deepEqual(
    a.dependents,
    [[b, mapFn]],
    "parent stream lists the correct dependents and subscribed functions"
  );
  assert.equal(mapFn.callCount, 1, "map function called once for an update");
  b.end(true);
  assert.deepEqual(
    b.parents,
    [],
    "dependent stream no longer lists parent after being closed"
  );
  assert.deepEqual(
    a.dependents,
    [],
    "parent stream no longer lists dependents after it closed"
  );
  a(3)(5);
  assert.equal(
    mapFn.callCount,
    1,
    "map function isn't called again after stream is closed"
  );
  assert.equal(
    b(),
    2,
    "dependent stream value remains the same from before being closed"
  );
  assert.equal(a.state, ACTIVE, "parent stream remains active");
  assert.equal(b.state, CLOSED, "dependent stream is closed");
});

test("map - can be ended with END signal", assert => {
  const a = createStream<number>(2);
  const mapFn = spy((n: number) => (n === 5 ? SKIP : n));
  const b = a.pipe(map<number>(mapFn));
  b(END);
  assert.equal(b.state, CLOSED, "END signal correctly closes stream");
});

test("map - will only push to Streams that aren't closed", assert => {
  const a = createStream<number>();
  const b = map<number>(n => n + 1)(a);
  const c = map<number>(n => n + 2)(b);
  const d = map<number, string>(n => n.toString(16))(b);
  const e = map<number, boolean>(n => n < 5)(b);
  assert.equal(b.dependents.length, 3, "parent stream has three dependents");
  a(9);
  assert.equal(c(), 12, "first dependent receives correct value");
  assert.equal(d(), "a", "second dependent receives correct value");
  assert.equal(e(), false, "third dependent receives correct value");
  d.end(true);
  a(3);
  assert.equal(c(), 6, "first dependent updates correctly");
  assert.equal(d(), "a", "second dependent doesn't update");
  assert.equal(e(), true, "third dependent updates correctly");
  assert.equal(
    b.dependents.length,
    2,
    "parent stream lists only two active dependents"
  );
});

test("map - will throw an error if trying to map a non Stream function", assert => {
  assert.throws(
    () => map((n: number) => n)(((n: number) => n) as Stream<number>),
    "throws an error upon receiving an invalid function"
  );
});
