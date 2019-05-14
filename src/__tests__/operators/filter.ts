import { createCell } from "../../cell";
import { CellState } from "../../constants";
import { filter, map } from "../../operators/index";

describe("filter", () => {
  it("is pipeable", () => {
    const a = createCell<number>();
    const b = a.pipe(
      filter(value => value % 2 !== 1),
      map(value => value ** 2)
    );
    a(4);
    expect(b()).toBe(16);
  });
  it("will filter values from being emitted if they don't pass its predicate function", () => {
    const a = createCell<number>();
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
    expect(mockFn).toBeCalledTimes(0);
    a(2);
    expect(b()).toBe(4);
    expect(mockFn).toBeCalledTimes(1);
    expect(mockFn).toBeCalledWith(2);
  });
  it("will filter initial values", () => {
    const a = createCell<number>(5);
    const mockFn = jest.fn((value: number) => value ** 2);
    const b = a.pipe(
      filter(value => value % 2 !== 1),
      map(mockFn)
    );
    expect(mockFn).toBeCalledTimes(0);
    expect(b.state).toBe(CellState.PENDING);
  });
});