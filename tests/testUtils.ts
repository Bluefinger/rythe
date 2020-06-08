import { useFakeTimers } from "sinon";
import Timers from "@sinonjs/fake-timers";

export const delay = <T>(ms: number, value?: T, error?: true): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const fn = error ? reject : resolve;
    setTimeout(fn, ms, value);
  });

export const getMockTimer = () => {
  const mocked = useFakeTimers();
  return {
    next: () => mocked.next(),
    tick: (ms: number) => mocked.tick(ms),
    now: () => mocked.now,
    runAll: () => mocked.runAll(),
    flush: () => Promise.resolve(mocked.runAll()),
    restore: () => mocked.restore(),
  };
};

export const getFrameTimers = () => {
  const clock = Timers.install();
  /* eslint-disable */
  (global as any).requestAnimationFrame = clock.requestAnimationFrame;
  (global as any).cancelAnimationFrame = clock.cancelAnimationFrame;
  return {
    runToFrame: () => clock.runToFrame(),
    countTimers: () => clock.countTimers(),
    uninstall: () => {
      clock.uninstall();
      (global as any).requestAnimationFrame = undefined;
      (global as any).cancelAnimationFrame = undefined;
    },
  };
  /* eslint-enable */
};
