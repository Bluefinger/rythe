import { Stream, StreamTuple } from "../types/stream";
import { createStream, isStream } from "../stream";
import { PENDING, CLOSED } from "../constants";
import { SOURCE_ERROR, INVALID_ARGUMENTS } from "../errors";
import { subscriber, subscribeSink } from "../utils/subscriber";
import { emitSKIP, emitEND } from "../signal";

const bufferReady = <T>(values: T[]) => values.length;
const popValue = <T>(values: T[]) => values.pop();
const initBuffers = <T>(): T[] => [];

export function zip<T extends Stream<any>[]>(
  ...sources: T
): Stream<StreamTuple<T>> {
  if (!sources.length) {
    throw new Error(INVALID_ARGUMENTS);
  }
  const zipped = createStream<StreamTuple<T>>();
  zipped.waiting = -1;

  const buffers = sources.map(initBuffers) as StreamTuple<T>[];
  const ending: number[] = [];
  let immediate = emitSKIP<StreamTuple<T>>();

  const bufferIsExhausted = (endIndex: number) => !buffers[endIndex].length;

  for (let i = sources.length; i--; ) {
    const source = sources[i];
    if (!isStream(source)) {
      throw new Error(SOURCE_ERROR);
    }
    const subFn = (value: unknown): StreamTuple<T> => {
      buffers[i].unshift(value);
      return buffers.every(bufferReady)
        ? (buffers.map(popValue) as StreamTuple<T>)
        : emitSKIP();
    };
    const endFn = () => {
      ending.push(i);
    };
    subscriber<StreamTuple<T>, any>(zipped, source, subFn);
    if (source.state !== PENDING) {
      immediate = subFn(source.val);
    }
    if (source.state === CLOSED) {
      endFn();
    } else {
      subscribeSink(source.end, endFn);
    }
  }
  subscribeSink(zipped, () => {
    if (ending.length && ending.some(bufferIsExhausted)) {
      zipped(emitEND());
    }
  });
  return zipped(immediate);
}
