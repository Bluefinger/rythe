import { createStream } from "rythe/stream";
import { dropWith, map } from "rythe/operators";

it("will not pass down repeat values according to its predicate function", () => {
  const a = createStream<any>();
  const mapFn = jest.fn((n: any) => n);
  const m = a.pipe(
    dropWith<any>((prev, next) => prev && prev.val === next.val),
    map(mapFn)
  );
  a({ val: 1 })({ val: 1 })({ val: 2 })({ val: 2 })({ val: 2 })({ val: 3 });
  expect(m()).toEqual({ val: 3 });
  expect(mapFn).toBeCalledTimes(3);
});
it("passes down initial value immediately", () => {
  const a = createStream<any>({ val: 1 });
  const mapFn = jest.fn((n: any) => n);
  const m = a.pipe(
    dropWith<any>((prev, next) => prev && prev.val === next.val),
    map(mapFn)
  );
  expect(m()).toEqual({ val: 1 });
  expect(mapFn).toBeCalledTimes(1);
});
