import { Stream, OperatorFn } from "../types";
import { scan } from "./scan";
import { map } from "./map";
import { createStream } from "../stream";

const clearStore = <T>(values: T[], emit: Stream<T[]>) => {
  if (values.length) {
    emit(values.slice());
    values.length = 0;
  }
};

/**
 * Time-slicing Stream. Buffers all values during a set interval into an array,
 * and then once the duration passes, emits a copied array with the collected values
 * and resets the internal array. Does not emit when there are no collected values.
 */
export const during = <T>(duration: number): OperatorFn<T, T[]> => (
  source: Stream<T>
): Stream<T[]> => {
  const emit = createStream<T[]>();
  const accumulator = scan<T>((stored: T[], value: T): T[] => {
    stored.push(value);
    return stored;
  }, [])(source);
  const tick = setInterval(clearStore, duration, accumulator(), emit);
  emit.end.pipe(
    map(ended => {
      clearInterval(tick);
      accumulator.end(ended);
      accumulator.val.length = 0;
    })
  );
  return emit;
};
