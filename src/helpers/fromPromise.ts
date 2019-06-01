import { createStream } from "../stream";
import { Stream } from "../types";
import { END } from "../signal";
import { noop } from "../utils/noop";

export const fromPromise = <T>(
  promise: Promise<T>,
  errorHandler: (reason: any) => void = noop
): Stream<T> => {
  const promiseStream = createStream<T>();
  promise.then(promiseStream, errorHandler).finally(
    (): void => {
      promiseStream(END);
    }
  );
  return promiseStream;
};
