# every

## `every(duration: number): Stream<number>`

The `every()` helper function creates a 'Stream' that emits on an interval. It takes a duration input in milliseconds and returns a `Stream<number>` output, emitting a timestamp of the interval execution.

`every()` is a self-correcting interval timer, so it will always try to execute at the exact given interval, while correcting for delays that might incur due to javascript's single threaded nature.

`every()` executes immediately once, and then at every n milliseconds as defined by the duration parameter.

```typescript
const stream = every(100); // will emit every 100 milliseconds

const output = stream.pipe(
  map(console.log), // will log the timestamp of the interval to the console
  scan(acc => ++acc, 0)
);

output(); // will emit 1
// 200 milliseconds later
setTimeout(output, 200); // will emit 3
```
