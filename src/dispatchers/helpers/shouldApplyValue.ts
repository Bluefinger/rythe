import { END, SKIP } from "../../signal";
import { Cell } from "../../types";

/**
 * Checks the incoming value for END or SKIP signals, otherwise it updates the cell
 * value and returns true to initiate a broadcast.
 */
export const shouldApplyValue = <T>(cell: Cell<T>, value: T): boolean => {
  if (value === END) {
    cell.end(true);
  } else if (value !== SKIP) {
    cell.val = value;
    return true;
  }
  return false;
};
