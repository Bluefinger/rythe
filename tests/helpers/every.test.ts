import { every } from "rythe/helpers";
import { isStream } from "rythe/stream";
import { StreamState } from "rythe/constants";
import { scan } from "rythe/operators";
import { advanceBy, advanceTo } from "jest-date-mock";

jest.useFakeTimers();

describe("every", () => {
  afterEach(() => {
    jest.clearAllTimers();
  });
  it("returns a stream", () => {
    const t = every(100);
    expect(isStream(t)).toBe(true);
    expect(t.state).toBe(StreamState.ACTIVE);
  });
  it("pushes a timestamp every n milliseconds", () => {
    advanceTo(new Date());
    const now = Date.now();
    const t = every(1000);
    const s = t.pipe(scan(acc => ++acc, 0));
    expect(s.val).toBe(1);
    expect(t.val).toBe(now);
    advanceBy(1);
    jest.advanceTimersByTime(1);
    expect(s.val).toBe(1);
    expect(t.val).toBe(now);
    advanceBy(1000);
    jest.advanceTimersByTime(1000);
    expect(s.val).toBe(2);
    expect(t.val).toBe(now + 1001);
    advanceBy(1001);
    jest.advanceTimersByTime(1001);
    expect(s.val).toBe(3);
  });
  it("defaults to 0 duration", () => {
    const t = every();
    const s = t.pipe(scan(acc => ++acc, 0));
    expect(s.val).toBe(1);
    advanceBy(1);
    jest.runOnlyPendingTimers();
    expect(s.val).toBe(2);
  });
  it("cleans up the timer on end", () => {
    advanceTo(new Date());
    const t = every(1000);
    const s = t.pipe(scan(acc => ++acc, 0));
    expect(s.val).toBe(1);
    advanceBy(1000);
    jest.runOnlyPendingTimers();
    expect(s.val).toBe(2);
    t.end(true);
    advanceBy(1000);
    jest.runOnlyPendingTimers();
    expect(s.val).toBe(2);
  });
});
