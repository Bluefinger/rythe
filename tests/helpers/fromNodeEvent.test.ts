import { fromNodeEvent } from "../../src/helpers";
import { isStream } from "../../src/stream";
import { ACTIVE, PENDING } from "../../src/constants";
import { test } from "../testHarness";
import { EventEmitter } from "events";

test("fromNodeEvent - returns a Stream", assert => {
  const events = new EventEmitter();
  const s = fromNodeEvent(events, "test");
  assert.equal(isStream(s), true, "returns a valid Stream function");
  assert.equal(s.state, PENDING, "is set to PENDING state");
  assert.equal(events.listenerCount("test"), 1, "creates an event listener");
});

test("fromNodeEvent - resolves data from the emitter", assert => {
  const events = new EventEmitter();
  const s = fromNodeEvent(events, "test");
  events.emit("test", "foo");
  assert.equal(s(), "foo", "emits the value from the event listener");
  assert.equal(s.state, ACTIVE, "updates to ACTIVE state");
});

test("fromNodeEvent - removes its listeners when the stream is closed", assert => {
  const events = new EventEmitter();
  const s = fromNodeEvent(events, "test");
  s.end(true);
  assert.equal(
    events.listenerCount("test"),
    0,
    "cleans up the event listener it created when ended"
  );
});
