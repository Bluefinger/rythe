import { isStream, createStream } from "../../src/stream";
import { scan, after } from "../../src/operators";
import { test } from "../testHarness";
import { useFakeTimers } from "sinon";

test("after - returns a stream", assert => {
  const a = createStream<number>();
  const af = a.pipe(after(100));
  assert.equal(isStream(af), true, "produces a valid Stream function");
});

test("after - emits a list of accumulated values after a specified period of no updates", assert => {
  const clock = useFakeTimers();
  const a = createStream<number>();
  const af = a.pipe(after(100));
  const count = af.pipe(scan<number[], number>(num => ++num, 0));
  assert.equal(af(), undefined, "should be initialised with no value");
  assert.equal(count(), 0, "should not emit anything after initialisation");
  a(2);
  clock.tick(80);
  assert.equal(
    af(),
    undefined,
    "after should not update before its defined waiting period"
  );
  assert.equal(count(), 0, "should not emit before its waiting period");
  a(4);
  clock.tick(20);
  assert.equal(
    af(),
    undefined,
    "after's waiting period reset after another value is received"
  );
  assert.equal(
    count(),
    0,
    "after should still not emit while still receiving values within waiting period"
  );
  a(6);
  clock.tick(100);
  assert.deepEqual(
    af(),
    [2, 4, 6],
    "after should update now that waiting period has expired"
  );
  assert.equal(count(), 1, "after should emit once to dependents");
  a(8)(10);
  clock.tick(100);
  assert.deepEqual(
    af(),
    [8, 10],
    "after should not store values from previous emit, only those that are collected in a new waiting period"
  );
  assert.equal(count(), 2, "after should emit a second time");
  clock.restore();
});

test("after - stops accumulating after being ended", assert => {
  const clock = useFakeTimers();
  const a = createStream<number>();
  const af = a.pipe(after(100));
  const count = af.pipe(scan<number[], number>(num => ++num, 0));
  a(2)(4);
  clock.tick(100);
  a(6)(8);
  clock.tick(20);
  af.end(true);
  clock.tick(100);
  assert.deepEqual(
    af(),
    [2, 4],
    "after should only contain values from before it was ended"
  );
  assert.equal(
    count(),
    1,
    "after should only have emitted once and not after being ended"
  );
  clock.restore();
});
