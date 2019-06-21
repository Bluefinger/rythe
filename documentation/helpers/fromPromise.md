# fromPromise

## `fromPromise<T>(promise: Promise<T>): Stream<T>`

`fromPromise` takes a `Promise<T>` as input and yields a `Stream<T>` as output, emitting the value from the resolved promise. After the promise resolves and the resolved value is emitted by the `Stream<T>`, the stream then closes as there will be no further updates from the `Promise<T>`.

```typescript
const req = fetch("http://example.com/stuff.json");
const stream = fromPromise(req);

// when the fetch completes, the stream will emit a Fetch Response object.
// Then this gets piped through various maps to extract data from the response.
stream.pipe(
  map(response => response.json()),
  map(({ things }) => things)
);
```
