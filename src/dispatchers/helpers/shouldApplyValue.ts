import { END, SKIP } from "../../signal";
import { Cell } from "../../types";

export const shouldApplyValue = <T>(cell: Cell<T>, value: T) => {
  if (value === END) {
    cell.end(true);
  } else if (value !== SKIP) {
    cell.val = value;
    return true;
  }
  return false;
};
