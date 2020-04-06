import { test } from "../testHarness";
import { bufferValues } from "../../src/utils/bufferValues";

test("bufferValues - appends new values to a given array", (assert) => {
  const buffer: number[] = [1];
  const result = bufferValues(buffer, 2);
  assert.deepEqual(result, [1, 2], "buffer mutated with the correct value");
});

test("bufferValues - does not return a new array instance", (assert) => {
  const buffer: number[] = [1];
  const result = bufferValues(buffer, 2);
  assert.strictEqual(
    buffer,
    result,
    "returned array is the same as input array"
  );
});
