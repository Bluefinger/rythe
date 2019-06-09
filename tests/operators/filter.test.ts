import { createStream } from "rythe/stream";
import { StreamState } from "rythe/constants";
import { filter, map, combine, scan } from "rythe/operators";
import { Stream } from "rythe/types";

describe("filter", () => {
  it("is pipeable", () => {
    const a = createStream<number>();
    const b = a.pipe(
      filter(value => value % 2 !== 1),
      map(value => value ** 2)
    );
    a(4);
    expect(b()).toBe(16);
  });
  it("will filter values from being emitted if they don't pass its predicate function", () => {
    const a = createStream<number>();
    const mockFn = jest.fn((value: number) => value ** 2);
    const b = a.pipe(
      filter(value => value % 2 !== 1),
      map(mockFn)
    );
    a(4);
    expect(b()).toBe(16);
    expect(mockFn).toBeCalledTimes(1);
    expect(mockFn).toBeCalledWith(4);
    mockFn.mockClear();
    a(5);
    expect(b()).toBe(16);
    expect(b.waiting).toBe(0);
    expect(mockFn).toBeCalledTimes(0);
    a(7);
    expect(b.waiting).toBe(0);
    expect(b.state).toBe(StreamState.ACTIVE);
    a(2);

    expect(b.waiting).toBe(0);
    expect(b()).toBe(4);
    expect(mockFn).toBeCalledTimes(1);
    expect(mockFn).toBeCalledWith(2);
  });
  it("will filter initial values", () => {
    const a = createStream<number>(5);
    const mockFn = jest.fn((value: number) => value ** 2);
    const b = a.pipe(
      filter(value => value % 2 !== 1),
      map(mockFn)
    );
    expect(mockFn).toBeCalledTimes(0);
    expect(b.state).toBe(StreamState.PENDING);
  });
  it("will filter atomically", () => {
    const combineFn = jest.fn((...args: Stream<number>[]): string =>
      JSON.stringify(args)
    );
    const a = createStream<number>();
    const b = a.pipe(filter(value => value % 2 === 0));
    const c = a.pipe(filter(value => value < 3 || value > 4));
    const d = a.pipe(filter(value => value !== 3));
    const atomic = combine(combineFn, b, c, d).pipe(
      scan<string>(
        (acc, value) => {
          acc.push(value);
          return acc;
        },
        [] as string[]
      )
    );
    // All filters will update
    a(2);
    expect(combineFn).toBeCalledTimes(1);
    // All filters should exclude this value
    a(3);
    // Two filters will pass this
    a(4);
    expect(combineFn).toBeCalledTimes(2);
    a(5)(6);
    expect(combineFn).toBeCalledTimes(4);
    expect(atomic()).toEqual(["[2,2,2]", "[4,2,4]", "[4,5,5]", "[6,6,6]"]);
  });
});
