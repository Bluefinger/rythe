import { END, SKIP } from "../../signal";
import { Stream } from "../../types";

/**
 * Checks the incoming value for END or SKIP signals, otherwise it updates the stream
 * value and returns true to initiate a broadcast.
 */
export const shouldApplyValue = <T>(stream: Stream<T>, value: T): boolean => {
  if (value === END) {
    stream.end(true);
  } else if (value !== SKIP) {
    stream.val = value;
    return true;
  }
  return false;
};
