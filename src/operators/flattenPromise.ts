import { Stream } from "../types";
import { createStream } from "../stream";
import { map } from "./map";
import { noop } from "../utils/noop";

export function flattenPromise<T>(
  source: Stream<Promise<T>> | Stream<PromiseLike<T>>,
  errorHandler: (reason: any) => void = noop
): Stream<T> {
  const flattened = createStream<T>();
  map<PromiseLike<T>, void>(promise => {
    promise.then(flattened, errorHandler);
  })(source as Stream<PromiseLike<T>>);
  return flattened;
}
