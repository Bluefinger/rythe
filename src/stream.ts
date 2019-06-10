import { StreamState } from "./constants";
import { recursiveDispatcher as dispatch } from "./dispatchers/recursiveDispatcher";
import { Stream, Closer, OperatorFn } from "./types";
import { pipeFromArray } from "./utils/pipe";

const { CLOSED, PENDING } = StreamState;

function toJSON(this: Stream<any>): any {
  return this.val != null && this.val.toJSON ? this.val.toJSON() : this.val;
}

function toString(this: Stream<any>): string {
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

function boundPipe<T>(
  this: Stream<T>,
  ...operators: OperatorFn<any, any>[]
): Stream<any> {
  if (!operators.length) {
    return this;
  }
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
  stream.updating = false;

  stream.pipe = boundPipe;
  stream.toJSON = toJSON;
  stream.toString = toString;
  stream.constructor = initStream;

  return stream as Stream<T>;
};

/**
 * Checks for whether the input is a Stream object.
 */
export const isStream = (obj: any): boolean =>
  obj && obj.constructor === initStream;

/**
 * Stream Factory function. Creates a Stream function based on the type of
 * the initial value, or by the type definition.
 */
export const createStream = <T>(initialValue?: T): Stream<T> => {
  const next = function(value: T): T | Stream<T> {
    if (!arguments.length) {
      return next.val;
    }
    dispatch(next, value);
    return next;
  } as Stream<T>;

  const complete = function(value: boolean): boolean | Stream<boolean> {
    if (!arguments.length) {
      return complete.val;
    } else if (complete.state && value && typeof value === "boolean") {
      dispatch(complete, value);
      close(next)(complete);
    }
    return complete;
  } as Stream<boolean>;

  const stream = initStream<T>(next);
  stream.end = initStream<boolean>(complete);
  stream.end.val = false;
  stream.end.end = stream.end;

  if (initialValue !== undefined) {
    stream(initialValue);
  }

  return stream;
};
