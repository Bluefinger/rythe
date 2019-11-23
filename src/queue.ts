import { Stream } from "./types";

const QUEUE_SIZE = 1024;
let pointer = 0;
let queue: Stream<any>[] = [];
let isExecuting = 0;

export const startExecuting = () => isExecuting++;
export const stopExecuting = () => isExecuting--;
export const canExecute = () => isExecuting === 1 && queue.length - pointer > 0;

export const clearQueuedItem = () => {
  queue[pointer++] = undefined as any;
};

export const nextQueueItem = () => {
  let old;
  const stream = queue[pointer];
  clearQueuedItem();
  if (pointer === QUEUE_SIZE) {
    old = queue;
    queue = old.slice(QUEUE_SIZE);
    old.length = pointer = 0;
  }
  return stream;
};

export const addQueueItem = (fn: Stream<any>) => {
  queue.push(fn);
};
