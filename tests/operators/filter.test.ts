import { createStream } from "../../src/stream";
import { PENDING } from "../../src/constants";
import { filter, map, combine, scan } from "../../src/operators";
import { Stream } from "../../src/types/stream";
import { test } from "../testHarness";
import { spy } from "sinon";

test("filter - is pipeable", (assert) => {
  const a = createStream<number>();
  const b = a.pipe(
    filter((value) => value % 2 !== 1),
    map((value) => value ** 2)
  );
  a(4);
  assert.equal(
    b(),
    16,
    "should receive value after passing the filter predicate"
  );
});

test("filter - will filter values from being emitted if they don't pass its predicate function", (assert) => {
  const a = createStream<number>();
  const mockFn = spy((value: number) => value ** 2);
  const b = a.pipe(
    filter((value) => value % 2 !== 1),
    map(mockFn)
  );
  a(4);
  assert.equal(
    mockFn.callCount,
    1,
    "map function should be called once with value that passes the filter predicate"
  );
  assert.equal(
    mockFn.calledWith(4),
    true,
    "map function receives correct value"
  );
  mockFn.resetHistory();
  a(5);
  assert.equal(
    b(),
    16,
    "shouldn't update with value that fails the filter predicate"
  );
  assert.equal(
    mockFn.callCount,
    0,
    "map function is not called with filtered value"
  );
});

test("filter - will filter initial values", (assert) => {
  const a = createStream<number>(5);
  const mockFn = spy((value: number) => value ** 2);
  const b = a.pipe(
    filter((value) => value % 2 !== 1),
    map(mockFn)
  );
  assert.equal(
    mockFn.callCount,
    0,
    "initial value should be filtered as it doesn't pass the filter predicate"
  );
  assert.equal(b.state, PENDING, "dependent stream should remain as PENDING");
});

test("filter - will filter atomically", (assert) => {
  const combineFn = spy((...args: Stream<number>[]): string =>
    JSON.stringify(args)
  );
  const a = createStream<number>();
  const b = a.pipe(filter((value) => value % 2 === 0));
  const c = a.pipe(filter((value) => value < 3 || value > 4));
  const d = a.pipe(filter((value) => value !== 3));
  const atomic = combine(combineFn, b, c, d).pipe(
    scan<string>((acc, value) => acc.concat(value), [] as string[])
  );
  a(2);
  assert.equal(combineFn.callCount, 1, "all filters will update once");
  a(3)(4);
  assert.equal(
    combineFn.callCount,
    2,
    "all filters will SKIP 3, two update on 4"
  );
  a(5)(6);
  assert.equal(combineFn.callCount, 4, "filters will update twice");
  assert.deepEqual(
    atomic(),
    ["[2,2,2]", "[4,2,4]", "[4,5,5]", "[6,6,6]"],
    "should have four results from four updates and one SKIP"
  );
});
