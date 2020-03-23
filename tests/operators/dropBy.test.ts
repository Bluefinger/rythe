import { createStream, isStream } from "../../src/stream";
import { dropBy, map } from "../../src/operators";
import { test } from "../testHarness";
import { TestObj } from "../testTypes";
import { spy } from "sinon";

test("dropBy - returns a valid Stream", (assert) => {
  const a = createStream<TestObj<number>>();
  const drop = a.pipe(dropBy("val"));
  assert.equal(isStream(drop), true, "returns a valid Stream function");
});

test("dropBy - will not pass down repeat values according to its predicate function", (assert) => {
  const a = createStream<TestObj<number>>();
  const mapFn = spy((n: TestObj<number>) => n);
  const m = a.pipe(dropBy("val"), map(mapFn));
  a({ val: 1 })({ val: 1 })({ val: 2 })({ val: 2 })({ val: 2 })({ val: 3 });
  assert.deepEqual(
    m(),
    { val: 3 },
    "dependent stream is updated with the correct value"
  );
  assert.equal(
    mapFn.callCount,
    3,
    "dependent stream updates only when it receives unique values"
  );
});

test("dropBy - passes down initial value immediately", (assert) => {
  const a = createStream<TestObj<number>>({ val: 1 });
  const mapFn = spy((n: TestObj<number>) => n);
  const m = a.pipe(dropBy("val"), map(mapFn));
  assert.deepEqual(
    m(),
    { val: 1 },
    "dependent stream receives initial value immediately"
  );
  assert.equal(
    mapFn.callCount,
    1,
    "dependent stream is updated once by the initial value"
  );
});
