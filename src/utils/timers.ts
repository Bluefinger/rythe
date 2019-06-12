const timerStore = new WeakMap<Function, any>();

export const timers = {
  add(fn: Function, timer: any) {
    timerStore.set(fn, timer);
  },
  clear(fn: Function) {
    const timer = timerStore.get(fn);
    if (timer) {
      clearTimeout(timer);
      timerStore.delete(fn);
    }
  },
  interval(fn: (timestamp: number) => any, duration: number, tick: number) {
    fn(tick);
    const now = Date.now();
    const target = tick + duration;
    const delta = target - now;
    timers.add(fn, setTimeout(timers.interval, delta, fn, duration, target));
  }
};
