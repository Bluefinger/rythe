import { map } from "./map";
import { SKIP } from "../signal";

export const select = <
  T extends any = any,
  K extends keyof T = string | number | symbol
>(
  key: K
) => map<T, NonNullable<T[K]>>(obj => obj[key] ?? SKIP);
