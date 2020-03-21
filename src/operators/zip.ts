import { Stream, StreamValuesAsTuple } from "../types/stream";
import { createStream, isStream } from "../stream";
import { PENDING, CLOSED } from "../constants";
import { SOURCE_ERROR, INVALID_ARGUMENTS } from "../errors";
import { subscriber } from "../utils/subscriber";
import { map } from "./map";
import { END, SKIP } from "../signal";

const bufferReady = (values: any[]) => values.length;
const popValue = (values: any[]) => values.pop();
const initBuffers = (): any[] => [];

export function zip<T extends Stream<any>[]>(
  ...sources: T
): Stream<StreamValuesAsTuple<T>> {
  if (!sources.length) {
    throw new Error(INVALID_ARGUMENTS);
  }
  const zipped = createStream<any>();
  zipped.waiting = -1;

  const buffers = sources.map(initBuffers);
  const ending: number[] = [];
  let immediate = SKIP;

  const bufferIsExhausted = (endIndex: number) => !buffers[endIndex].length;

  for (let i = sources.length; i--; ) {
    const source = sources[i];
    if (!isStream(source)) {
      throw new Error(SOURCE_ERROR);
    }
    const subFn = (value: any): any[] => {
      buffers[i].unshift(value);
      return buffers.every(bufferReady) ? buffers.map(popValue) : SKIP;
    };
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
    if (ending.length && ending.some(bufferIsExhausted)) {
      zipped(END);
    }
  })(zipped);
  return zipped(immediate);
}
