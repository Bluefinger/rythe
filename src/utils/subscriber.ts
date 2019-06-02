import { Stream, StreamFn } from "../types";

export const subscriber = <T, U>(
  stream: Stream<U>,
  parent: Stream<T>,
  subscribeFn: StreamFn<T, U>
): Stream<U> => {
  parent.dependents.push([stream, subscribeFn]);
  const currentParents = stream.parents;
  if (!currentParents) {
    stream.parents = parent;
  } else if (Array.isArray(currentParents)) {
    currentParents.push(parent);
  } else {
    stream.parents = [currentParents, parent];
  }
  return stream;
};
