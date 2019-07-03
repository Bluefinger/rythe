import { Stream, OperatorFn } from "../types";
import { map } from "./map";
import { SKIP } from "../signal";

/**
 * Ends a Stream using another Stream's invocation.
 */
export function endsWith<T>(end: Stream<any>): OperatorFn<any, T> {
  return <T>(stream: Stream<T>): Stream<T> => {
    map(() => stream.end(true), SKIP)(end);
    return stream;
  };
}
