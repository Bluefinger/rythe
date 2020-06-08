import { Stream, OperatorFn } from "../types/stream";
import { emitEND } from "../signal";
import { subscriber } from "../utils/subscriber";

/**
 * Ends a Stream using another Stream's invocation.
 */
export function endsWith<T>(end: Stream<any>): OperatorFn<any, T> {
  return (stream: Stream<T>): Stream<T> =>
    subscriber<any, T>(stream, end, emitEND);
}
