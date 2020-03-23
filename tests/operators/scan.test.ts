import { createStream, isStream } from "../../src/stream";
import { map, scan } from "../../src/operators";
import { test } from "../testHarness";
import { spy } from "sinon";

test("scan - should default to an initial value", (assert) => {
  const a = createStream<number>();
  const s = scan((acc, value) => acc + value, 0)(a);
  assert.equal(isStream(s), true, "returns a valid Stream function");
  assert.equal(s(), 0, "always emits the initial value");
});

test("scan - should accumulate values", (assert) => {
  const a = createStream<number>(0);
  const s = scan<number, string>((acc, value) => acc + value, "")(a);
  a(1)(2)(3);
  assert.equal(
    s(),
    "0123",
    "accumulates emitted values from source and then emits accumulated result"
  );
});

test("scan - is pipeable", (assert) => {
  const a = createStream<number>();
  const m = a.pipe(
    scan((acc, value) => acc + value, 0),
    map((value) => value + 1)
  );
  a(1)(2)(3);
  assert.equal(
    m(),
    7,
    "dependent stream receives emitted value from scan stream correctly"
  );
});

test("scan - emits initial value to dependent streams", (assert) => {
  const atomic: number[] = [];
  const scanFn = spy((acc: number, value: number) => acc + value);
  const a = createStream<number>();
  a.pipe(
    scan(scanFn, 0),
    map((value) => atomic.push(value))
  );
  assert.deepEqual(
    atomic,
    [0],
    "dependent stream receives initial value from scan immediately"
  );
  assert.equal(
    scanFn.callCount,
    0,
    "scan stream wasn't called to accumulate a value"
  );
});

test("scan - stops accumulating after .end is invoked", (assert) => {
  const a = createStream<number>();
  const scanFn = spy((acc: number, value: number) => acc + value);
  const s = scan(scanFn, 0)(a);

  a(1)(2)(3);
  assert.deepEqual(
    s.parents,
    [a],
    "scan function initially is subscribed to parent stream for updates"
  );
  assert.equal(scanFn.callCount, 3, "scan is updated three times while ACTIVE");
  scanFn.resetHistory();
  s.end(true);
  a(5)(6);
  assert.deepEqual(
    s.parents,
    [],
    "scan function is no longer subscribed to parent stream for updates"
  );
  assert.equal(scanFn.callCount, 0, "scan no longer updates now it is CLOSED");
});
