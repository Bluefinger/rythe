/**
 * forEach() alternative, but iterates from right to left.
 */
export const eachRight = <T>(
  items: T[],
  eachFn: (item: T, index: number, array: T[]) => any,
  context?: any
) => {
  for (let index = items.length; index--; ) {
    eachFn.call(context, items[index], index, items);
  }
};
