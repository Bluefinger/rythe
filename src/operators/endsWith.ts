import { Stream, OperatorFn } from "../types";
import { subscriber } from "../utils/subscriber";
import { END } from "../signal";

const killFn = (): any => END;

export function endsWith<T>(end: Stream<any>): OperatorFn<any, T>;

/**
 * Ends a Stream using another Stream's invocation.
 */
export function endsWith(end: Stream<any>): OperatorFn<any, any> {
  return <T>(stream: Stream<T>): Stream<T> => subscriber(stream, end, killFn);
}
