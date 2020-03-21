import { Stream, StreamValuesAsTuple } from "../types/stream";
import { createStream, isStream } from "../stream";
import { PENDING, CLOSED } from "../constants";
import { SOURCE_ERROR, INVALID_ARGUMENTS } from "../errors";
import { subscriber } from "../utils/subscriber";
import { map } from "./map";
import { END, SKIP } from "../signal";

const zipFn = (buffer: any[][], index: number) => (value: any): any[] => {
  buffer[index].push(value);
  return buffer.every(values => values.length)
    ? buffer.map(values => values.shift())
    : SKIP;
};

export function zip<T extends Stream<any>[]>(
  ...sources: T
): Stream<StreamValuesAsTuple<T>> {
  if (!sources.length) {
    throw new Error(INVALID_ARGUMENTS);
  }
  const zipped = createStream<any>();
  zipped.waiting = -1;
  const buffer = sources.map<any[]>(() => []);
  const ending: number[] = [];
  let immediate = SKIP;
  for (let i = sources.length; i--; ) {
    const source = sources[i];
    if (!isStream(source)) {
      throw new Error(SOURCE_ERROR);
    }
    const subFn = zipFn(buffer, i);
    const endFn = () => {
      ending.push(i);
    };
    subscriber(zipped, source, subFn);
    if (source.state !== PENDING) {
      immediate = subFn(source.val);
    }
    if (source.state === CLOSED) {
      endFn();
    } else {
      map<boolean, void>(endFn)(source.end);
    }
  }
  map(() => {
    if (ending.length && ending.some(endIndex => !buffer[endIndex].length)) {
      zipped(END);
    }
  })(zipped);
  return zipped(immediate);
}
