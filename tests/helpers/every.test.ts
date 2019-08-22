import { every } from "../../src/helpers";
import { isStream } from "../../src/stream";
import { ACTIVE } from "../../src/constants";
import { scan } from "../../src/operators";
import { test } from "../testHarness";
import { useFakeTimers } from "sinon";

test("every - returns a stream", assert => {
  const clock = useFakeTimers();
  const t = every(100);
  assert.equal(isStream(t), true, "produces a valid Stream function");
  assert.equal(t(), clock.now, "emits the timestamp value");
  assert.equal(t.state, ACTIVE, "starts as ACTIVE by default");
  clock.restore();
});

test("every - pushes a timestamp every n milliseconds", assert => {
  const clock = useFakeTimers();
  const t = every(1000);
  const s = t.pipe(scan(acc => ++acc, 0));
  assert.equal(s(), 1, "emits once initially");
  clock.tick(1);
  assert.equal(s(), 1, "won't emit again until a defined interval has elapsed");
  clock.tick(1000);
  assert.equal(s(), 2, "emits after said interval has elapsed");
  clock.restore();
});

test("every - defaults to 0 duration", assert => {
  const clock = useFakeTimers();
  const t = every();
  const s = t.pipe(scan(acc => ++acc, 0));
  clock.next();
  assert.equal(s(), 2, "emits immediately on next timeout tick");
  clock.restore();
});

test("every - cleans up the timer on end", assert => {
  const clock = useFakeTimers();
  const t = every(1000);
  const s = t.pipe(scan(acc => ++acc, 0));
  clock.tick(1000);
  clock.tick(500);
  t.end(true);
  clock.tick(500);
  assert.equal(s(), 2, "won't emit again after being closed");
  clock.restore();
});
