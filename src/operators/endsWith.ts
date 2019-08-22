import { Stream, OperatorFn } from "../types";
import { END } from "../signal";
import { subscriber } from "../utils/subscriber";

const killFn = () => END;

/**
 * Ends a Stream using another Stream's invocation.
 */
export function endsWith<T>(end: Stream<any>): OperatorFn<any, T> {
  return <T>(stream: Stream<T>): Stream<T> => subscriber(stream, end, killFn);
}
