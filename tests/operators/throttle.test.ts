import { throttle, map } from "../../src/operators";
import { test } from "../testHarness";
import { fake } from "sinon";
import { getFrameTimers } from "../testUtils";
import { createStream } from "../../src";

test("throttle - emits the latest value collected during animation frame", (assert) => {
  const clock = getFrameTimers();
  const a = createStream<number>();
  const mockFn = fake((n: any) => n);
  const throttled = a.pipe(throttle, map(mockFn));
  // Execute three updates
  a(1)(2)(3);
  assert.equal(
    mockFn.callCount,
    0,
    "frame function is not executed immediately"
  );
  clock.runToFrame();
  assert.equal(mockFn.callCount, 1, "frame function is executed once only");
  assert.equal(
    throttled(),
    3,
    "dependent stream receives only the latest value"
  );
  clock.uninstall();
});

test("throttle - does not emit after being ended before animation frame executes", (assert) => {
  const clock = getFrameTimers();
  const a = createStream<number>();
  const throttled = a.pipe(throttle);
  // Execute an update
  a(1);
  assert.equal(clock.countTimers(), 1, "one timer is queued");
  throttled.end(true);
  assert.equal(clock.countTimers(), 0, "no more timers are queued");
  clock.runToFrame();
  assert.equal(
    throttled(),
    undefined,
    "throttled stream never updates after being ended"
  );
  clock.uninstall();
});
