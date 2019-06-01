import { createStream } from "../stream";
import { Stream } from "../types";
import { END } from "../signal";

export const fromPromise = <T>(promise: PromiseLike<T>): Stream<T> => {
  const promiseStream = createStream<T>();
  const end = (): void => {
    promiseStream(END);
  };
  promise.then(promiseStream, end).then(end);
  return promiseStream;
};
