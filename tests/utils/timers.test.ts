import { advanceBy, advanceTo } from "jest-date-mock";
import { addTimer, addInterval, clearTimer } from "rythe/utils/timers";

jest.useFakeTimers();

describe("timers", () => {
  afterEach(() => {
    jest.clearAllTimers();
  });
  it("adds timers", () => {
    const mockFn = jest.fn();
    addTimer(mockFn, 10, "foo");
    jest.advanceTimersByTime(10);
    expect(mockFn).toBeCalledTimes(1);
    expect(mockFn).toBeCalledWith("foo");
  });
  it("clears timers", () => {
    const mockFn = jest.fn();
    addTimer(mockFn, 10, "foo");
    jest.advanceTimersByTime(5);
    expect(mockFn).toBeCalledTimes(0);
    clearTimer(mockFn);
    jest.advanceTimersByTime(10);
    expect(mockFn).toBeCalledTimes(0);
  });
  it("creates self-adjusting interval timers", () => {
    advanceTo(new Date());
    const mockFn = jest.fn();
    const now = Date.now();
    addInterval(mockFn, 20);
    // interval executes function once to start at time 0
    expect(mockFn).toBeCalledTimes(1);
    expect(mockFn).toBeCalledWith(now);
    // Introduce a delay on the next execution
    advanceBy(25);
    jest.advanceTimersByTime(20);
    expect(mockFn).toBeCalledTimes(2);
    expect(mockFn).toBeCalledWith(now + 20);
    // Check if the delay is compensated for
    advanceBy(15);
    jest.advanceTimersByTime(15);
    expect(mockFn).toBeCalledTimes(3);
    expect(mockFn).toBeCalledWith(now + 20 + 20);
  });
});
