import { StreamState } from "./constants";
import { recursiveDispatcher as dispatch } from "./dispatchers/recursiveDispatcher";
import { Stream, Closer, OperatorFn } from "./types";
import { pipeFromArray } from "./utils/pipe";

const { CLOSED, PENDING } = StreamState;

function toJSON(this: Stream<any>): any {
  return this.val != null && this.val.toJSON ? this.val.toJSON() : this.val;
}

function removeDep(this: Stream<any>, parent: Stream<any>): void {
  let index: number;
  const deps = parent.dependents;
  for (index = deps.length; index--; ) {
    if (deps[index][0] === this) {
      break;
    }
  }
  deps.splice(index, 1);
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
  if (Array.isArray(stream.parents)) {
    stream.parents.forEach(removeDep, stream);
  } else if (stream.parents) {
    removeDep.call(stream, stream.parents);
  }
  stream.dependents.length = 0;
  stream.parents = null;
  stream.state = CLOSED;
  return close;
};

const initStream = <T>(stream: Partial<Stream<T>>): Stream<T> => {
  stream.dependents = [];
  stream.parents = null;
  stream.state = PENDING;
  stream.waiting = 0;

  stream.pipe = boundPipe;
  stream.toJSON = toJSON;
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
  let stream: Stream<T>;

  function next(value?: T): T | Stream<T> {
    if (!arguments.length) {
      return stream.val;
    }
    // ESLint and TS unable to determine that if arguments.length is greater than 0,
    // that value will be explicit. Also, Stream typing will reflect if undefined/null
    // will be passed, so the non-null assertion is required here.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    dispatch(stream, value!);
    return stream;
  }
  function complete(value?: boolean): boolean | Stream<boolean> {
    if (!arguments.length) {
      return stream.end.val;
    } else if (stream.end.state && value && typeof value === "boolean") {
      dispatch(stream.end, value);
      close(stream)(stream.end);
    }
    return stream.end;
  }

  stream = initStream<T>(next as Partial<Stream<T>>);
  stream.end = initStream<boolean>(complete as Partial<Stream<boolean>>);
  stream.end.val = false;
  stream.end.end = stream.end;

  if (initialValue !== undefined) {
    stream(initialValue);
  }

  return stream;
};
