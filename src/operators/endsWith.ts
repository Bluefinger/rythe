import { Stream, OperatorFn } from "../types";
import { map } from "./map";
import { SKIP } from "../signal";

export function endsWith<T>(end: Stream<any>): OperatorFn<any, T>;

/**
 * Ends a Stream using another Stream's invocation.
 */
export function endsWith(end: Stream<any>): OperatorFn<any, any> {
  return <T>(stream: Stream<T>): Stream<T> => {
    map(() => stream.end(true), SKIP)(end);
    return stream;
  };
}
