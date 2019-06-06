import { Stream, StreamFn } from "../types";

export const subscriber = <T, U>(
  stream: Stream<U>,
  parent: Stream<T>,
  subscribeFn: StreamFn<T, U>
): Stream<U> => {
  parent.dependents.push([stream, subscribeFn]);
  stream.parents.push(parent);
  return stream;
};
