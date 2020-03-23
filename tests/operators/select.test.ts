import { createStream, isStream } from "../../src/stream";
import { select, scan } from "../../src/operators";
import { test } from "../testHarness";
import { TestObj, DeepTestObj } from "../testTypes";

test("select - returns a valid Stream", (assert) => {
  const s = createStream<any>();
  const sel = s.pipe(select());
  assert.equal(isStream(sel), true, "select returns a valid stream function");
});

test("select - selects a property from an object and emits it", (assert) => {
  const a = createStream<TestObj<boolean>>();
  const s = a.pipe(select("val"));
  const emitted = s.pipe(scan<any, number>((num) => ++num, 0));
  a({ val: true })({ val: false });
  assert.equal(s(), false, "select emits the selected property value");
  assert.equal(emitted(), 2, "select emitted twice");
});

test("select - does not emit undefined or null when selected as a value", (assert) => {
  const a = createStream<Partial<TestObj<number | null>>>();
  const s = a.pipe(select("val"));
  const emitted = s.pipe(scan((num) => ++num, 0));
  a({ val: 2 })({})({ val: null });
  assert.equal(
    s(),
    2,
    "dependency contains last emitted value, does not get updated with an undefined or null value"
  );
  assert.equal(emitted(), 1, "select emitted only once");
});

test("select - does a deep select on a nested object", (assert) => {
  const a = createStream<DeepTestObj<number>>();
  const s = a.pipe(select("a", "b", 0));
  const emitted = s.pipe(scan((num) => ++num, 0));
  a({ a: { b: [2] } })({})({ a: { b: null } });
  assert.equal(
    s(),
    2,
    "dependency contains last emitted value from the deep search, does not get updated with an undefined paths or null values"
  );
  assert.equal(emitted(), 1, "deep select emitted only once");
});

test("select - can select properties of primitive types", (assert) => {
  const a = createStream<string>();
  const s = a.pipe(select("length"));
  a("test string");
  assert.equal(s(), 11, "property from string is emitted");
});
