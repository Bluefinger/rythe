import {
  addTimer,
  addInterval,
  clearTimer,
  addFrame,
  clearFrame,
} from "../../src/utils/timers";
import { test } from "../testHarness";
import { fake } from "sinon";
import { getFrameTimers, getMockTimer } from "../testUtils";

test("Timers - adds timers", (assert) => {
  const clock = getMockTimer();
  const mockFn = fake();
  addTimer(mockFn, 10, "foo");
  assert.equal(
    mockFn.callCount,
    0,
    "timer function is not executed immediately"
  );
  clock.tick(10);
  assert.equal(
    mockFn.callCount,
    1,
    "timer function executes after defined period of time elapses"
  );
  assert.equal(
    mockFn.calledWith("foo"),
    true,
    "timer function receives correct arguments"
  );
  clock.restore();
});

test("Timers - clears timers", (assert) => {
  const clock = getMockTimer();
  const mockFn = fake();
  addTimer(mockFn, 10, "foo");
  clock.tick(5);
  clearTimer(mockFn);
  clock.tick(5);
  assert.equal(
    mockFn.callCount,
    0,
    "timer function does not execute after being cleared"
  );
  clock.restore();
});

test("Timers - creates self-adjusting interval timers", (assert) => {
  const clock = getMockTimer();
  const mockFn = fake();
  addInterval(mockFn, 20);
  assert.equal(
    mockFn.callCount,
    1,
    "interval function executes immediately once"
  );
  assert.equal(
    mockFn.calledWith(0),
    true,
    "interval function receives initial timestamp"
  );
  clock.tick(25);
  assert.equal(
    mockFn.callCount,
    2,
    "interval function executes again after elapsed period"
  );
  assert.equal(
    mockFn.calledWith(20),
    true,
    "interval function receives target timestamp"
  );
  clock.tick(15);
  assert.equal(
    mockFn.callCount,
    3,
    "interval function executes after adjusting for previous delay"
  );
  assert.equal(
    mockFn.calledWith(40),
    true,
    "interval function receives corrected target timestamp"
  );
  clock.restore();
});

test("Timers - add animation frame", (assert) => {
  const clock = getFrameTimers();
  const mockFn = fake();
  addFrame(mockFn);
  assert.equal(
    mockFn.callCount,
    0,
    "frame function is not executed immediately"
  );
  assert.equal(clock.countTimers(), 1, "one framed is queued");
  addFrame(mockFn);
  assert.equal(
    clock.countTimers(),
    1,
    "queueing the same frame again does nothing"
  );
  clock.runToFrame();
  assert.equal(
    mockFn.callCount,
    1,
    "frame function executes once with the animation frame"
  );
  clock.uninstall();
});

test("Timers - clear animation frame", (assert) => {
  const clock = getFrameTimers();
  const mockFn = fake();
  addFrame(mockFn);
  assert.equal(clock.countTimers(), 1, "one framed is queued");
  clearFrame(mockFn);
  clock.runToFrame();
  assert.equal(
    mockFn.callCount,
    0,
    "cleared frame function did not execute with the animation frame"
  );
  assert.equal(clock.countTimers(), 0, "no more frames are queued");
  try {
    clearFrame(mockFn);
  } catch (e) {
    assert.fail(
      "should not error after retrying to clear the same frame again"
    );
  }
  clock.uninstall();
});
