export class Queuer<T> {
  private queue: T[];
  constructor() {
    this.queue = [];
  }
  get size() {
    return this.queue.length;
  }
  public enqueue(item: T) {
    this.queue.push(item);
  }
  public dequeue() {
    if (!this.queue.length) {
      return undefined;
    }
    const item = this.queue[0];
    this.queue = this.queue.slice(1);
    return item;
  }
}
