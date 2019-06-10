import { createStream } from "../stream";
import { Stream } from "../types";
import { END } from "../signal";

export const fromPromise = <T>(promise: Promise<T>): Stream<T> => {
  const promiseStream = createStream<T>();
  promise.then(
    (value: T) => promiseStream(value)(END),
    () => promiseStream(END)
  );
  return promiseStream;
};
