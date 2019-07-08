import { INVALID_ARGUMENTS } from "../errors";

export const makeUInt = (amount: number): number => {
  if (typeof amount !== "number" || amount !== amount) {
    throw new Error(INVALID_ARGUMENTS);
  }
  return Math.floor(Math.abs(amount));
};
