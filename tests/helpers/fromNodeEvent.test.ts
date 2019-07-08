import { fromNodeEvent } from "rythe/helpers";
import { isStream } from "rythe/stream";
import { ACTIVE, PENDING } from "rythe/constants";
import { EventEmitter } from "events";

describe("fromNodeEvent", () => {
  it("returns a Stream", () => {
    const events = new EventEmitter();
    const s = fromNodeEvent(events, "test");
    expect(isStream(s)).toBe(true);
    expect(s.state).toBe(PENDING);
    expect(events.listenerCount("test")).toBe(1);
  });
  it("resolves data from the emitter", () => {
    const events = new EventEmitter();
    const s = fromNodeEvent(events, "test");
    events.emit("test", "foo");
    expect(s()).toBe("foo");
    expect(s.state).toBe(ACTIVE);
  });
  it("removes its listeners when the stream is closed", () => {
    const events = new EventEmitter();
    const s = fromNodeEvent(events, "test");
    expect(events.listenerCount("test")).toBe(1);
    s.end(true);
    expect(events.listenerCount("test")).toBe(0);
  });
});
