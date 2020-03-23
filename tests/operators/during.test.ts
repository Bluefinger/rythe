import { isStream, createStream } from "../../src/stream";
import { scan, during } from "../../src/operators";
import { test } from "../testHarness";
import { getMockTimer } from "../testUtils";

test("during - returns a Stream", (assert) => {
  const clock = getMockTimer();
  const a = createStream<number>();
  const d = a.pipe(during(100));
  assert.equal(isStream(d), true, "returns a valid Stream function");
  d.end(true);
  clock.restore();
});

test("during - collects values it receives and only emits after set duration has passed", (assert) => {
  const clock = getMockTimer();
  const a = createStream<number>();
  const d = a.pipe(during(100));
  a(1)(2)(3);
  assert.equal(
    d(),
    undefined,
    "doesn't update before set duration has elapsed"
  );
  clock.tick(100);
  assert.deepEqual(
    d(),
    [1, 2, 3],
    "updates with an array of values collected within set period"
  );
  a(4)(5);
  clock.tick(50);
  a(6);
  clock.tick(50);
  assert.deepEqual(
    d(),
    [4, 5, 6],
    "returns a new list of collected values if it received more after the last emit"
  );
  d.end(true);
  clock.restore();
});

test("during - doesn't collect values after it has ended", (assert) => {
  const clock = getMockTimer();
  const a = createStream<number>();
  const d = a.pipe(during(100));
  a(1)(2)(3);
  clock.tick(100);
  d.end(true);
  clock.tick(50);
  a(4)(5);
  clock.tick(50);
  assert.deepEqual(
    d(),
    [1, 2, 3],
    "keeps old values as it is no longer collecting new values"
  );
  clock.restore();
});

test("during - won't emit if it receives no values", (assert) => {
  const clock = getMockTimer();
  const a = createStream<number>();
  const d = a.pipe(during(100));
  const count = d.pipe(scan<number[], number>((num) => ++num, 0));
  a(1)(2)(3);
  clock.tick(100);
  assert.equal(
    count(),
    1,
    "dependent stream received one initial update after values were collected"
  );
  clock.tick(100);
  assert.equal(
    count(),
    1,
    "dependent stream didn't receive further update as no values were collected since last emit"
  );
});
