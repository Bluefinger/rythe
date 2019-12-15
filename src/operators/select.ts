import { map } from "./map";
import { SKIP } from "../signal";
import { OperatorFn } from "../types/stream";
import { DeepSearch } from "../types/utils";

export function select<T extends any>(): OperatorFn<T, T>;
export function select<T extends any, K extends keyof T>(
  ...keys: [K]
): OperatorFn<T, NonNullable<T[K]>>;
export function select<
  T extends any,
  K1 extends keyof T,
  K2 extends keyof DeepSearch<T, [K1]>
>(...keys: [K1, K2]): OperatorFn<T, DeepSearch<T, [K1, K2]>>;
export function select<
  T extends any,
  K1 extends keyof T,
  K2 extends keyof DeepSearch<T, [K1]>,
  K3 extends keyof DeepSearch<T, [K1, K2]>
>(...keys: [K1, K2, K3]): OperatorFn<T, DeepSearch<T, [K1, K2, K3]>>;
export function select<
  T extends any,
  K1 extends keyof T,
  K2 extends keyof DeepSearch<T, [K1]>,
  K3 extends keyof DeepSearch<T, [K1, K2]>,
  K4 extends keyof DeepSearch<T, [K1, K2, K3]>
>(...keys: [K1, K2, K3, K4]): OperatorFn<T, DeepSearch<T, [K1, K2, K3, K4]>>;
export function select<
  T extends any,
  K1 extends keyof T,
  K2 extends keyof DeepSearch<T, [K1]>,
  K3 extends keyof DeepSearch<T, [K1, K2]>,
  K4 extends keyof DeepSearch<T, [K1, K2, K3]>,
  K5 extends keyof DeepSearch<T, [K1, K2, K3, K4]>
>(
  ...keys: [K1, K2, K3, K4, K5]
): OperatorFn<T, DeepSearch<T, [K1, K2, K3, K4, K5]>>;
export function select<
  T extends any,
  K1 extends keyof T,
  K2 extends keyof DeepSearch<T, [K1]>,
  K3 extends keyof DeepSearch<T, [K1, K2]>,
  K4 extends keyof DeepSearch<T, [K1, K2, K3]>,
  K5 extends keyof DeepSearch<T, [K1, K2, K3, K4]>,
  K6 extends keyof DeepSearch<T, [K1, K2, K3, K4, K5]>
>(
  ...keys: [K1, K2, K3, K4, K5]
): OperatorFn<T, DeepSearch<T, [K1, K2, K3, K4, K5, K6]>>;
export function select<
  T extends any,
  K1 extends keyof T,
  K2 extends keyof DeepSearch<T, [K1]>,
  K3 extends keyof DeepSearch<T, [K1, K2]>,
  K4 extends keyof DeepSearch<T, [K1, K2, K3]>,
  K5 extends keyof DeepSearch<T, [K1, K2, K3, K4]>,
  K6 extends keyof DeepSearch<T, [K1, K2, K3, K4, K5]>,
  K7 extends keyof DeepSearch<T, [K1, K2, K3, K4, K5, K6]>
>(
  ...keys: [K1, K2, K3, K4, K5]
): OperatorFn<T, DeepSearch<T, [K1, K2, K3, K4, K5, K6, K7]>>;
export function select<
  T extends any,
  K1 extends keyof T,
  K2 extends keyof DeepSearch<T, [K1]>,
  K3 extends keyof DeepSearch<T, [K1, K2]>,
  K4 extends keyof DeepSearch<T, [K1, K2, K3]>,
  K5 extends keyof DeepSearch<T, [K1, K2, K3, K4]>,
  K6 extends keyof DeepSearch<T, [K1, K2, K3, K4, K5]>,
  K7 extends keyof DeepSearch<T, [K1, K2, K3, K4, K5, K6]>,
  K8 extends keyof DeepSearch<T, [K1, K2, K3, K4, K5, K6, K7]>
>(
  ...keys: [K1, K2, K3, K4, K5]
): OperatorFn<T, DeepSearch<T, [K1, K2, K3, K4, K5, K6, K7, K8]>>;
export function select<
  T extends any,
  K1 extends keyof T,
  K2 extends keyof DeepSearch<T, [K1]>,
  K3 extends keyof DeepSearch<T, [K1, K2]>,
  K4 extends keyof DeepSearch<T, [K1, K2, K3]>,
  K5 extends keyof DeepSearch<T, [K1, K2, K3, K4]>,
  K6 extends keyof DeepSearch<T, [K1, K2, K3, K4, K5]>,
  K7 extends keyof DeepSearch<T, [K1, K2, K3, K4, K5, K6]>,
  K8 extends keyof DeepSearch<T, [K1, K2, K3, K4, K5, K6, K7]>,
  K9 extends keyof DeepSearch<T, [K1, K2, K3, K4, K5, K6, K7, K8]>
>(
  ...keys: [K1, K2, K3, K4, K5]
): OperatorFn<T, DeepSearch<T, [K1, K2, K3, K4, K5, K6, K7, K8, K9]>>;
export function select<
  T extends any = any,
  K extends (string | number | symbol)[] = []
>(...keys: K): OperatorFn<T, any>;

export function select<
  T extends any = any,
  K extends (string | number | symbol)[] = []
>(...keys: K) {
  return map<T>(obj => {
    let val: any = obj;
    for (let i = 0; i < keys.length; i++) {
      val = val[keys[i]] ?? SKIP;
      if (val === SKIP) break;
    }
    return val;
  });
}
