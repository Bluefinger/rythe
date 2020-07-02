import { CLOSED, PENDING } from "./constants";
import { dispatcher as push } from "./dispatcher";
import {
  Stream,
  ImmediateStream,
  OperatorFn,
  EndStream,
  SinkStream,
} from "./types/stream";
import { Closer } from "./types/internal";
import { pipeFromArray } from "./utils/pipe";
import { noop } from "./utils/noop";

function toJSON(this: Stream<unknown>): unknown {
  return this.val != null && (this.val as Stream<unknown>).toJSON
    ? ((this.val as Stream<unknown>).toJSON() as unknown)
    : this.val;
}

function toString(this: Stream<any>): string {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  return `streamFn{${this.val}}`;
}

function removeDep(this: Stream<any>, { dependents }: Stream<any>): void {
  let index = dependents.length;
  while (index--) {
    if (dependents[index][0] === this) {
      break;
    }
  }
  dependents.splice(index, 1);
}

function boundPipe<T, Fns extends OperatorFn<any, any>[]>(
  this: Stream<T>,
  ...operators: Fns
): Stream<any> {
  if (!operators.length) {
    return this;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return pipeFromArray(operators)(this);
}

const close: Closer = <T>(stream: Stream<T>): Closer => {
  stream.parents.forEach(removeDep, stream);
  stream.dependents.length = stream.parents.length = 0;
  stream.state = CLOSED;
  return close;
};

const initStream = <T>(stream: Partial<Stream<T>>): Stream<T> => {
  stream.dependents = [];
  stream.parents = [];
  stream.state = PENDING;
  stream.waiting = 0;

  stream.pipe = boundPipe;
  stream.toJSON = toJSON;
  stream.toString = toString;
  stream.constructor = initStream;

  return stream as Stream<T>;
};

/**
 * Checks for whether the input is a Stream object.
 */
export const isStream = (obj: unknown): boolean =>
  obj && (obj as Stream<unknown>).constructor === initStream;

/**
 * Stream Factory function. Creates a Stream function based on the type of
 * the initial value, or by the type definition.
 */
export const createStream = <T>(initialValue?: T): Stream<T> => {
  const next = function (value: T): T | Stream<T> {
    if (!arguments.length) {
      return next.val;
    }
    push(next, value);
    return next;
  } as Stream<T>;

  const complete = function (value: boolean): boolean {
    if (complete.state && value === true) {
      push(complete, value);
      close(next)(complete);
    }
    return complete.val;
  } as EndStream;

  const stream = initStream<T>(next);
  stream.end = initStream<boolean>(complete);
  stream.end.val = false;
  stream.end.end = stream.end;

  if (initialValue !== undefined) {
    stream(initialValue);
  }

  return stream;
};

export const createImmediateStream = <T>(
  initialValue?: T
): ImmediateStream<T> => {
  const stream = createStream(initialValue);
  stream.waiting = -1;
  return stream as ImmediateStream<T>;
};

const createSink = (): SinkStream => {
  const sink = () => {};
  const stream = initStream<any>(sink as Stream<any>);
  stream.end = stream;
  Object.defineProperties(stream, {
    val: {
      set: noop,
    },
    state: {
      set: noop,
      get: () => CLOSED,
    },
  });
  return stream as SinkStream;
};

/**
 * Sink for events/emits to be terminated without requiring unnecessary
 * stream functions to be created
 */
export const sink = createSink();
