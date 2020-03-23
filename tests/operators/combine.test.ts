import { Stream } from "../../src/types/stream";
import { createStream } from "../../src/stream";
import { ACTIVE, PENDING } from "../../src/constants";
import { combine, map, scan } from "../../src/operators";
import { test } from "../testHarness";

test("combine - transforms value", (assert) => {
  const a = createStream<number>();
  const b = combine((sA) => sA() + 1, a);
  a(2);
  assert.equal(b(), 3, "updates from a single sources");
});

test("combine - transforms default value", (assert) => {
  const a = createStream<number>(4);
  const b = combine((sA) => sA() - 1, a);
  assert.equal(b(), 3, "updates from an initial value from source");
});

test("combine - transforms multiple values", (assert) => {
  const a = createStream<number>();
  const b = createStream<string>();
  const c = combine((sA, sB) => sA() + sB(), a, b);
  a(1);
  b("5");
  assert.equal(c(), "15", "combines updates from multiple sources");
});

test("combine - transforms multiple default values", (assert) => {
  const a = createStream<number>(2);
  const b = createStream<number>(4);
  const c = combine((sA, sB) => sA() + sB(), a, b);
  assert.equal(c(), 6, "combines multiple initial values");
});

test("combine - transforms mixed default and emitted values", (assert) => {
  const a = createStream<number>(5);
  const b = createStream<number>();
  const c = combine((sA, sB) => sA() + sB(), a, b);
  b(1);
  assert.equal(c(), 6, "combines initial values and updated values");
});

test("combine - combines values atomically", (assert) => {
  const a = createStream<number>();
  const b = a.pipe(map((num) => num + 2));
  const c = a.pipe(map((num) => num * 10));
  const testInference = (sA: Stream<number>, sB: Stream<number>): number =>
    sA() + sB();
  const atomic = combine(testInference, b, c).pipe(
    scan((acc, value: number) => acc.concat(value), [] as number[])
  );
  a(3)(4);
  assert.deepEqual(
    atomic(),
    [35, 46],
    "updates atomically with no intermediate values"
  );
});

test("combine - combines default values atomically", (assert) => {
  const a = createStream<number>(4);
  const b = a.pipe(map((num) => num + 2));
  const c = a.pipe(map((num) => num * 10));
  const atomic = combine((sA, sB) => sA() + sB(), b, c).pipe(
    scan((acc, value: number) => acc.concat(value), [] as number[])
  );
  assert.deepEqual(
    atomic(),
    [46],
    "updates initial values atomically with no intermediate values"
  );
});

test("combine - combines and maps nested streams atomically", (assert) => {
  const a = createStream<string>();
  const b = combine((sA) => sA() + 2, a);
  const c = combine((sA) => sA() + sA(), a);
  const d = c.pipe(map((x) => x + 1));
  const e = combine((x) => x() + 0, d);
  const atomic = combine((sB, sE) => sB() + sE(), b, e).pipe(
    scan<string>((acc, value) => acc.concat(value), [])
  );
  a("3")("4");
  assert.deepEqual(
    atomic(),
    ["323310", "424410"],
    "updates complex dependencies atomically with no intermediate values"
  );
});

test("combine - continues combining with ended streams", (assert) => {
  const a = createStream<number>();
  const b = createStream<number>();
  const combined = combine((sA, sB) => sA() + sB(), a, b);

  a(3);
  b(4);
  a.end(true);
  b(5);
  assert.equal(combined(), 8, "combines values from closed streams");
});

test("combine - removes all listeners with .end", (assert) => {
  const a = createStream<number>();
  const b = createStream<number>();
  const c = combine((sA, sB) => sA() + sB(), b, a);
  assert.deepEqual(
    c.parents,
    [a, b],
    "lists parent streams the combine stream is subscribed to"
  );
  a(3);
  b(4);

  c.end(true);
  b(5);
  assert.equal(c(), 7, "no longer updates after the combine stream is ended");
  assert.deepEqual(
    c.parents,
    [],
    "no longer lists streams as parents after being ended"
  );
  assert.deepEqual(
    b.dependents,
    [],
    "first parent stream no longer lists combine stream as dependent"
  );
  assert.deepEqual(
    a.dependents,
    [],
    "second parent stream no longer lists combine stream as dependent"
  );
});

test("combines - creates a pending stream when provided no source streams", (assert) => {
  const c = combine(() => true);
  assert.equal(c(), undefined, "initialises with no value");
  assert.equal(c.state, PENDING, "is set to PENDING state");
  c(false);
  assert.equal(c(), false, "only updates by direct calls");
  assert.equal(c.state, ACTIVE, "updates to ACTIVE state correctly");
});

test("combines - throws an error if the sources are not Stream functions", (assert) => {
  const fakeCell = (() => true) as Stream<boolean>;
  assert.throws(
    () => combine((fake) => fake(), fakeCell),
    "throws error on receiving invalid function"
  );
});
