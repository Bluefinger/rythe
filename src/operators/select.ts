import { map } from "./map";
import { SKIP } from "../signal";
import { OperatorFn } from "../types/stream";
import { DeepSearch, Key } from "../types/utils";

export const select = <T extends any = any, K extends Key[] = []>(
  ...keys: K
): OperatorFn<T, DeepSearch<T, K>> =>
  map<T, DeepSearch<T, K>>(obj => {
    let val: any = obj;
    for (let i = 0; i < keys.length; i++) {
      val = val[keys[i]] ?? SKIP;
      if (val === SKIP) break;
    }
    return val;
  });
