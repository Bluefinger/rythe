import { createStream } from "../stream";
import { Stream } from "../types/stream";
import { END } from "../signal";

export const fromPromise = <T>(promise: PromiseLike<T>): Stream<T> => {
  const promiseStream = createStream<T>();
  promise.then(
    (value: T) => promiseStream(value)(END),
    () => promiseStream(END)
  );
  return promiseStream;
};
