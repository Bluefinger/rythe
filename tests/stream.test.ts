import {
  createStream,
  createImmediateStream,
  isStream,
  sink,
} from "../src/stream";
import { ACTIVE, CLOSED, PENDING } from "../src/constants";
import { emitEND } from "../src/signal";
import { Stream } from "../src/types/stream";
import { test } from "./testHarness";

test("isStream - returns true only for valid stream functions", (assert) => {
  const a = createStream<number>(5);
  const b = () => {};
  const c = {};
  const d = 5;
  assert.equal(isStream(a), true, "value `a` is a valid Stream type");
  assert.equal(isStream(b), false, "value `b` is not a valid Stream type");
  assert.equal(isStream(c), false, "value `c` is not valid Stream type");
  assert.equal(isStream(d), false, "value `d` is not valid Stream type");
});

test("Stream - can act as a getter and setter", (assert) => {
  const a = createStream<number>(5);
  assert.equal(a(), 5, "Stream returns initial value");
  assert.equal(a(6), a, "Stream returns itself when updating with new value");
  assert.equal(a(), 6, "Stream is updated with new value");
});

test("Stream - returns undefined by default", (assert) => {
  const a = createStream<number>();
  assert.equal(
    a(),
    undefined,
    "Stream initialises with undefined value by default"
  );
});

test("Stream - it can be updated with an explicit undefined", (assert) => {
  const a = createStream<number | undefined>(5);
  a(undefined);
  assert.equal(
    a(),
    undefined,
    "Stream can be updated with an explicit undefined value"
  );
});

test("Stream - it can be updated with an explicit null", (assert) => {
  const a = createStream<number | null>(5);
  a(null);
  assert.equal(a(), null, "Stream can be updated with an explicit null value");
});

test("Stream - starts with pending state value and updates to active value", (assert) => {
  const a = createStream<number>();
  assert.equal(
    a.state,
    PENDING,
    "Stream initialised without an initial value has its state set to PENDING"
  );
  a(5);
  assert.equal(
    a.state,
    ACTIVE,
    "Stream updated with a value is set to ACTIVE state"
  );
});

test("Stream - can be ended by passing true to .end", (assert) => {
  const a = createStream<number>(5);
  assert.equal(a.end(), false, "Stream .end() returns false by default");
  a.end(true);
  assert.equal(a.end(), true, "Stream .end() returns true after being updated");
  assert.equal(
    a.state,
    CLOSED,
    "Stream state is set to CLOSED after .end(true) call"
  );
  a(6);
  assert.equal(a(), 6, "Stream value remains unchanged after being closed");
  assert.equal(
    a.state,
    CLOSED,
    "Stream state remains CLOSED after being updated with new value"
  );
});

test("Stream - can be ended with END signal", (assert) => {
  const a = createStream<number>(5);
  a(emitEND());
  assert.equal(
    a.state,
    CLOSED,
    "Stream state is set to CLOSED after receiving END signal"
  );
});

test("Stream - won't end if passed anything that isn't a boolean true value into .end", (assert) => {
  const a = createStream<number>(5);
  a.end(false);
  assert.equal(
    a.state,
    ACTIVE,
    "Stream won't close by passing false into .end()"
  );
  a.end(emitEND());
  assert.equal(
    a.state,
    ACTIVE,
    "Stream won't close by passing END signal into .end()"
  );
  a.end(5 as any);
  assert.equal(
    a.state,
    ACTIVE,
    "Stream won't close by passing any other value into .end()"
  );
  a.end(true);
  assert.equal(
    a.state,
    CLOSED,
    "Stream will only close by passing true into .end()"
  );
});

test("Stream - is pipeable", (assert) => {
  const a = createStream<number>();
  assert.equal(
    isStream(a.pipe()),
    true,
    ".pipe() always returns a valid Stream function"
  );
  assert.equal(
    a.pipe(),
    a,
    "An empty .pipe() call returns its original Stream as a result"
  );
});

test("Stream - toJSON - can serialise into a JSON string", (assert) => {
  const a = createStream<number>(2);
  const b = createStream<string>("foo");
  const c = createStream<Stream<number>>(a);
  const d = createStream<any>({ e: true });
  const e = createStream<any>();
  const f = createStream<any>(null);
  const json = JSON.stringify({ a, b, c, d, e, f });
  assert.equal(
    json,
    '{"a":2,"b":"foo","c":2,"d":{"e":true},"f":null}',
    "Stream is able to be serialised into a valid JSON string containing every Streams' values"
  );
});

test("Stream - toString - can serialise into a plain string", (assert) => {
  const a = createStream<number>(2);
  const b = createStream<Stream<number>>(a);
  assert.equal(
    a.toString(),
    "streamFn{2}",
    "Stream can be serialised into a plain string"
  );
  assert.equal(
    b.toString(),
    "streamFn{streamFn{2}}",
    "Nested Streams can be serialised into plain strings"
  );
});

test("ImmediateStream - create a Stream with a negative waiting value for immediate updates from multiple parents", (assert) => {
  const a = createImmediateStream<number>();
  assert.equal(isStream(a), true, "ImmediateStream is a valid Stream type");
  assert.equal(a.waiting, -1, "ImmediateStream waiting value is always -1");
});

test("Sink - Always returns void, with or without value passed in", (assert) => {
  assert.equal(sink(), undefined, "sink returns nothing");
  assert.equal(
    sink(5 as any),
    undefined,
    "sink does not return itself when passed a value"
  );
  assert.equal(
    sink.val,
    undefined,
    "sink is not updated after being given a value"
  );
  assert.equal(sink.state, CLOSED, "sink state is always closed");
});
