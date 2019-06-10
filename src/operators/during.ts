import { Stream, OperatorFn } from "../types";
import { scan } from "./scan";
import { map } from "./map";
import { createStream } from "../stream";

const clearStore = <T>(values: T[], emit: Stream<T[]>) => {
  emit(values.slice());
  values.length = 0;
};

/**
 * Time-slicing Stream. Buffers all values during a set interval into an array,
 * and then when the duration passes, emits that array with the collected values
 * and resets the store. Does not emit when there are no collected values.
 */
export const during = <T>(duration: number): OperatorFn<T, T[]> => (
  source: Stream<T>
): Stream<T[]> => {
  const emit = createStream<T[]>();
  const values: T[] = [];
  const accumulator = scan<T>((stored: T[], value: T): T[] => {
    stored.push(value);
    return stored;
  }, values)(source);
  const tick = setInterval(clearStore, duration, values, emit);
  emit.end.pipe(
    map(ended => {
      clearInterval(tick);
      accumulator.end(ended);
    })
  );
  return emit;
};
