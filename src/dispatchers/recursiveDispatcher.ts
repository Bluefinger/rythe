import { Stream, Dispatcher } from "../types";
import { isReady, markActive, markAsChanging } from "./dispatcherHelpers";
import { END, SKIP } from "../signal";

const pushUpdate = <T>(stream: Stream<T>, updating: boolean): void => {
  markActive(stream);
  const { dependents, val } = stream;
  for (let i = dependents.length; i--; ) {
    const [dep, fn] = dependents[i];
    if (isReady(dep)) {
      const newValue = updating || dep.updating ? fn(val) : SKIP;
      switch (newValue) {
        case SKIP:
          pushUpdate(dep, false);
          break;
        case END:
          pushUpdate(dep, false);
          dep.end(true);
          break;
        default:
          dep.val = newValue;
          pushUpdate(dep, true);
      }
      dep.updating = 0;
    } else if (updating) {
      dep.updating += 1;
    }
  }
};

/**
 * Dispatch Function for propagating Stream values across all dependencies.
 * Uses a recursive broadcast approach (newest dependency to oldest
 * dependency traversal).
 */
export const recursiveDispatcher: Dispatcher = <T>(
  stream: Stream<T>,
  value: T
): void => {
  switch (value) {
    case SKIP:
      break;
    case END:
      stream.end(true);
      break;
    default:
      stream.val = value;
      if (stream.state) {
        markAsChanging(stream);
        pushUpdate(stream, true);
      }
  }
};
