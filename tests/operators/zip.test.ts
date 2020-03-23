import { createStream, isStream } from "../../src/stream";
import { zip } from "../../src/operators";
import { Stream } from "../../src/types/stream";
import { ACTIVE, CLOSED, PENDING } from "../../src/constants";
import { test } from "../testHarness";

test("zip - zips multiple streams into a single array value", (assert) => {
  const a = createStream<number>();
  const b = createStream<string>();
  const z = zip(a, b);
  assert.equal(isStream(z), true, "returns a valid Stream function");
  a(5)(4)(3);
  b("c");
  assert.deepEqual(
    z(),
    [5, "c"],
    "zips first values together from each source stream"
  );
  b("d");
  assert.deepEqual(
    z(),
    [4, "d"],
    "zips second values together from each source stream"
  );
});

test("zip - zips all active streams immediately into an array value", (assert) => {
  const a = createStream<number>(2);
  const b = createStream<string>("b");
  const z = zip(a, b);
  assert.deepEqual(
    z(),
    [2, "b"],
    "zips initial values together from each source stream"
  );
});

test("zip - errors if a non-stream input is provided", (assert) => {
  const a = createStream<number>();
  const b = (() => true) as Stream<boolean>;
  assert.throws(
    () => zip(a, b),
    "throws error on receiving invalid function as source stream"
  );
});

test("zip - errors if no inputs are provided", (assert) => {
  assert.throws(() => zip(), "throws error on receiving no source streams");
});

test("zip - closes when any of its parent streams ends and exhausts available values from closed stream", (assert) => {
  const a = createStream<number>();
  const b = createStream<string>();
  const c = createStream<boolean>();
  const z = zip(a, b, c);
  a(8)(9)(10);
  b("e");
  c(true)(false);
  assert.deepEqual(z.state, ACTIVE, "initial zip state is ACTIVE");
  a.end(true);
  c.end(true);
  assert.deepEqual(
    z.state,
    ACTIVE,
    "zip state remains ACTIVE despite closed source streams"
  );
  b("f");
  assert.deepEqual(
    z.state,
    CLOSED,
    "zip state now CLOSED once a closed stream has no more queued values"
  );
});

test("zip - closes after the initial value of a closed stream has been zipped", (assert) => {
  const a = createStream<number>();
  const b = createStream<string>("a");
  b.end(true);
  const z = zip(a, b);
  assert.deepEqual(z.state, PENDING, "initial zip state is PENDING");
  a(10);
  assert.deepEqual(
    z.state,
    CLOSED,
    "zip state now CLOSED once the closed stream's initial value was consumed"
  );
});
