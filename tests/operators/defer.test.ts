import { defer, map } from "../../src/operators";
import { test } from "../testHarness";
import { fake } from "sinon";
import { getMockTimer } from "../testUtils";
import { createStream } from "../../src";

test("defer - emits the latest value collected after execution cycle", async (assert) => {
  const clock = getMockTimer();
  const a = createStream<number>();
  const mockFn = fake((n: number) => n);
  const deferred = a.pipe(defer, map(mockFn));
  // Execute three updates
  a(1)(2)(3);
  assert.equal(
    mockFn.callCount,
    0,
    "frame function is not executed immediately"
  );
  await clock.flush();
  assert.equal(mockFn.callCount, 1, "frame function is executed once only");
  assert.equal(
    deferred(),
    3,
    "dependent stream receives only the latest value"
  );
  clock.restore();
});

test("defer - does not emit after being closed", async (assert) => {
  const clock = getMockTimer();
  const a = createStream<number>();
  const mockFn = fake((n: number) => n);
  a.pipe(defer, map(mockFn));
  a(1);
  a.end(true);
  await clock.flush();
  assert.equal(
    mockFn.callCount,
    0,
    "subscribed stream did not emit as it received nothing"
  );
  clock.restore();
});
