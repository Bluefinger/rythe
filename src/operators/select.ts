import { map } from "./map";
import { SKIP } from "../signal";
import { OperatorFn } from "../types/stream";
import { DeepSearch, Key } from "../types/utils";
import { skipNullish } from "../utils/skipNullish";

export const select = <T extends any, K extends Key[]>(
  ...keys: K
): OperatorFn<T, DeepSearch<T, K>> =>
  map<T, DeepSearch<T, K>>((obj) => {
    let val: any = obj;
    for (let i = 0; i < keys.length; i += 1) {
      // We are checking here if a property exists or not
      // The type inference scheme will yield the correct
      // type at the end of the search, so no need to
      // enforce type linting until the value is meant to
      // be emitted
      // eslint-disable-next-line
      val = skipNullish(val[keys[i]]);
      if (val === SKIP) break;
    }
    return val as DeepSearch<T, K>;
  });
