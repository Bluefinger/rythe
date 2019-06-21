# `EndStream`

`Stream<T>` can be ended using either an `END` signal, or by passing `true` into its `.end` method. `.end` is an `EndStream` which is a specific type of `Stream`.

The only real difference between `Stream` and `EndStream` is that `EndStream` is effectively always `Stream<boolean>`, and it'll never return itself even if you pass a value into it. `EndStream` is intended as a one-shot update (`<boolean>(value?: boolean): boolean`), focused on only closing streams and not anything else. But this then allows `EndStream`s to be chained as map functions, so one `END` operation can close multiple streams in a terse manner, even when those `EndStream`s might have their own dependents.

```typescript
const stream = createStream<number>();
const other = createStream<string>();
const things = createStream<string>();

stream.end.pipe(
  map(other.end),
  map(things.end)
);
```

A `Stream<T>` that has been ended/closed can still have its own value updated. However, a closed `Stream<T>` will not emit that value to any other streams. `EndStream` will not update its own value however, as it is representative of its parent `Stream<T>`'s closed state. Once closed, `EndStream` will always yield `true`.
