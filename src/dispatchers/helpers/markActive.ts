import { CellState } from "../../constants";
import { Cell } from "../../types";

export const markActive = (cell: Cell<any>) => {
  cell.state = CellState.ACTIVE;
};
