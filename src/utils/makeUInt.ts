import { StreamError } from "../constants";

export const makeUInt = (amount: number): number => {
  if (typeof amount !== "number" || amount !== amount) {
    throw new Error(StreamError.INVALID_ARGUMENTS);
  }
  return Math.floor(Math.abs(amount));
};
