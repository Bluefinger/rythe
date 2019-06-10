import { Stream, OperatorFn } from "../types";
import { scan } from "./scan";
import { map } from "./map";
import { createStream } from "../stream";

const timers = new WeakMap<Stream<any>, any>();

const clearStore = <T>(values: T[], emit: Stream<T[]>) => {
  emit(values.slice());
  values.length = 0;
  timers.delete(emit);
};

/**
 * Buffering Stream. Accumulates a series of stream events into an array, and
 * after a period of no updates, it then emits that list.
 */
export const after = <T>(duration: number): OperatorFn<T, T[]> => (
  source: Stream<T>
): Stream<T[]> => {
  const emit = createStream<T[]>();
  const accumulator = scan<T>(
    (stored, value) => {
      stored.push(value);
      const emitter = timers.get(emit);
      if (emitter) {
        clearTimeout(emitter);
      }
      timers.set(emit, setTimeout(clearStore, duration, stored, emit));
      return stored;
    },
    [] as T[]
  )(source);
  emit.end.pipe(
    map(signal => {
      accumulator.end(signal);
      const emitter = timers.get(emit);
      if (emitter) {
        clearTimeout(emitter);
        timers.delete(emit);
      }
    })
  );
  return emit;
};
