import { CellState } from "../../constants";
import { Cell } from "../../types";

/** Mark a Cell as ACTIVE */
export const markActive = (cell: Cell<any>) => {
  cell.state = CellState.ACTIVE;
};
