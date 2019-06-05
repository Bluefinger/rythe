import { Stream } from "../types";
import { createStream } from "../stream";
import { map } from "./map";
import { noop } from "../utils/noop";

export function flattenPromise<T>(
  source: Stream<Promise<T>>,
  errorHandler: (reason: any) => void = noop
): Stream<T> {
  const flattened = createStream<T>();
  map<Promise<T>, void>(promise => {
    promise.then(flattened, errorHandler);
  })(source);
  return flattened;
}
