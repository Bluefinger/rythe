import { useFakeTimers } from "sinon";

export const delay = <T>(ms: number, value?: T, error?: true) =>
  new Promise<T>((resolve, reject) =>
    setTimeout(error ? reject : resolve, ms, value)
  );

export const getMockTimer = () => {
  const mocked = useFakeTimers();
  return {
    next: () => mocked.next(),
    tick: (ms: number) => mocked.tick(ms),
    now: () => mocked.now,
    runAll: () => mocked.runAll(),
    flush: () => Promise.resolve(mocked.runAll()),
    restore: () => mocked.restore()
  };
};
