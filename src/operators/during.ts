import { Stream, OperatorFn } from "../types";
import { scan } from "./scan";
import { map } from "./map";
import { every } from "../helpers";
import { createStream } from "../stream";

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
  const tick = every(duration);
  const reset = tick.pipe<void>(
    map(() => {
      if (values.length) {
        emit(values.slice());
        values.length = 0;
      }
    })
  );
  emit.end.pipe(
    map(ended => {
      tick.end(ended);
      accumulator.end(ended);
      reset.end(ended);
    })
  );
  return emit;
};
