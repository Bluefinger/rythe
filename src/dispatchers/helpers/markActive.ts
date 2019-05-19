import { CellState } from "../../constants";
import { Cell } from "../../types";

/** Mark a Cell as ACTIVE */
export const markActive = (cell: Cell<any>): void => {
  cell.state = CellState.ACTIVE;
};
