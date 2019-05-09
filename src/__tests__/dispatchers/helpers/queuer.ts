import { Queuer } from "../../../dispatchers/helpers/queuer";

describe("Queuer", () => {
  it("initialises into a Queue object", () => {
    const q = new Queuer<number>();
    expect(q instanceof Queuer).toBe(true);
    expect(q.size).toBe(0);
  });
  it("it returns undefined on dequeueing an empty queue", () => {
    const q = new Queuer<number>();
    expect(q.dequeue()).toBeUndefined();
  });
  it("it can queue and dequeue values", () => {
    const q = new Queuer<number>();
    q.enqueue(5);
    q.enqueue(4);
    expect(q.size).toBe(2);
    expect(q.dequeue()).toBe(5);
    expect(q.size).toBe(1);
  });
});
