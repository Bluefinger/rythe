import { createStream, isStream } from "../../src/stream";
import { dropWith, map } from "../../src/operators";
import { test } from "../testHarness";
import { spy } from "sinon";

test("dropWith - returns a valid Stream", assert => {
  const a = createStream<any>();
  const drop = a.pipe(dropWith((prev, next) => prev === next));
  assert.equal(isStream(drop), true, "returns a valid Stream function");
});

test("dropWith - will not pass down repeat values according to its predicate function", assert => {
  const a = createStream<any>();
  const mapFn = spy((n: any) => n);
  const m = a.pipe(
    dropWith<any>((prev, next) => prev && prev.val === next.val),
    map(mapFn)
  );
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

test("dropWith - passes down initial value immediately", assert => {
  const a = createStream<any>({ val: 1 });
  const mapFn = spy((n: any) => n);
  const m = a.pipe(
    dropWith<any>((prev, next) => prev && prev.val === next.val),
    map(mapFn)
  );
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
