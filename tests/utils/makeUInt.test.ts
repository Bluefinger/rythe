import { makeUInt } from "../../src/utils/makeUInt";
import { test } from "../testHarness";

test("makeUInt - takes a float and returns an integer", assert => {
  assert.equal(makeUInt(3.5), 3, "returns an integer");
});

test("makeUInt - takes a negative number/float and returns a positive integer", assert => {
  assert.equal(
    makeUInt(-3),
    3,
    "negative integers are returned as positive integers"
  );
  assert.equal(
    makeUInt(-3.5),
    3,
    "negative floats are returned as positive integers"
  );
});

test("makeUInt - guards against non-number types", assert => {
  assert.throws(() => makeUInt("3" as any), "throws when passed a string");
  assert.throws(() => makeUInt(true as any), "throws when passed a boolean");
  assert.throws(() => makeUInt({} as any), "throws when passed a plain object");
  assert.throws(() => makeUInt([] as any), "throws when passed an array");
  assert.throws(
    () => makeUInt((() => {}) as any),
    "throws when passed a function"
  );
  assert.throws(() => makeUInt(null as any), "throws when passed null");
  assert.throws(
    () => makeUInt(undefined as any),
    "throws when passed undefined"
  );
});

test("makeUInt - guards again NaN", assert => {
  assert.throws(() => makeUInt(NaN), "throws when passed NaN");
});
