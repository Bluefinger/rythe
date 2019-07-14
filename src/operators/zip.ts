import { Stream } from "../types";
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

export function zip(): never;
export function zip<A>(zip1: Stream<A>): Stream<[A]>;
export function zip<A, B>(zip1: Stream<A>, zip2: Stream<B>): Stream<[A, B]>;
export function zip<A, B, C>(
  zip1: Stream<A>,
  zip2: Stream<B>,
  zip3: Stream<C>
): Stream<[A, B, C]>;
export function zip<A, B, C, D>(
  zip1: Stream<A>,
  zip2: Stream<B>,
  zip3: Stream<C>,
  zip4: Stream<D>
): Stream<[A, B, C, D]>;
export function zip<A, B, C, D, E>(
  zip1: Stream<A>,
  zip2: Stream<B>,
  zip3: Stream<C>,
  zip4: Stream<D>,
  zip5: Stream<E>
): Stream<[A, B, C, D, E]>;
export function zip<A, B, C, D, E, F>(
  zip1: Stream<A>,
  zip2: Stream<B>,
  zip3: Stream<C>,
  zip4: Stream<D>,
  zip5: Stream<E>,
  zip6: Stream<F>
): Stream<[A, B, C, D, E, F]>;
export function zip<A, B, C, D, E, F, G>(
  zip1: Stream<A>,
  zip2: Stream<B>,
  zip3: Stream<C>,
  zip4: Stream<D>,
  zip5: Stream<E>,
  zip6: Stream<F>,
  zip7: Stream<G>
): Stream<[A, B, C, D, E, F, G]>;
export function zip<A, B, C, D, E, F, G, H>(
  zip1: Stream<A>,
  zip2: Stream<B>,
  zip3: Stream<C>,
  zip4: Stream<D>,
  zip5: Stream<E>,
  zip6: Stream<F>,
  zip7: Stream<G>,
  zip8: Stream<H>
): Stream<[A, B, C, D, E, F, G, H]>;
export function zip<A, B, C, D, E, F, G, H, I>(
  zip1: Stream<A>,
  zip2: Stream<B>,
  zip3: Stream<C>,
  zip4: Stream<D>,
  zip5: Stream<E>,
  zip6: Stream<F>,
  zip7: Stream<G>,
  zip8: Stream<H>,
  zip9: Stream<I>
): Stream<[A, B, C, D, E, F, G, H, I]>;
export function zip<T>(...sources: Stream<T>[]): Stream<T[]>;
export function zip(...sources: Stream<any>[]): Stream<any[]>;

export function zip(...sources: Stream<any>[]): Stream<any> {
  if (!sources.length) {
    throw new Error(INVALID_ARGUMENTS);
  }
  const zipped = createStream<any>();
  zipped.immediate = true;
  const buffer = sources.map<any[]>(() => []);
  const ending: number[] = [];
  let immediate = SKIP;
  for (let i = sources.length; i--; ) {
    const source = sources[i];
    if (!isStream(source)) {
      throw new Error(SOURCE_ERROR);
    }
    const subFn = zipFn(buffer, i);
    const endFn = () => ending.push(i);
    subscriber(zipped, source, subFn);
    if (source.state !== PENDING) {
      immediate = subFn(source.val);
    }
    if (source.state === CLOSED) {
      endFn();
    } else {
      map<boolean, number>(endFn)(source.end);
    }
  }
  map(() => {
    if (ending.length && ending.some(endIndex => !buffer[endIndex].length)) {
      zipped(END);
    }
  })(zipped);
  return zipped(immediate);
}
