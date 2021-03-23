const store = new WeakMap<(...args: any[]) => any, unknown>();

export const addTimer = <T extends (...args: any[]) => any>(
  fn: T,
  duration: number,
  ...args: Parameters<T>
): void => {
  store.set(fn, setTimeout(fn, duration, ...args));
};

export const clearTimer = (fn: (...args: any[]) => any): void => {
  const timer = store.get(fn);
  if (timer) {
    clearTimeout(timer as number);
    store.delete(fn);
  }
};

export const addInterval = (
  fn: (timestamp: number) => any,
  duration: number,
  tick = Date.now()
): void => {
  fn(tick);
  const now = Date.now();
  const target = tick + duration;
  const delta = target - now;
  store.set(fn, setTimeout(addInterval, delta, fn, duration, target));
};

export const clearFrame = (fn: (time: number) => void): void => {
  const frame = store.get(fn);
  if (frame) {
    cancelAnimationFrame(frame as number);
    store.delete(fn);
  }
};

export const addFrame = (fn: (time: number) => void): void => {
  if (!store.has(fn)) {
    store.set(
      fn,
      requestAnimationFrame((time) => {
        fn(time);
        store.delete(fn);
      })
    );
  }
};

export const addMicroTask = (fn: () => void): void => {
  if (!store.has(fn)) {
    store.set(
      fn,
      queueMicrotask(() => {
        fn();
        store.delete(fn);
      })
    );
  }
};
