import { createStream } from "rythe/stream";
import { StreamState } from "rythe/constants";
import { endsWith } from "rythe/operators";

describe("endsWith", () => {
  it("subscribes an existing Stream to another", () => {
    const a = createStream<number>();
    const b = createStream<string>();
    expect(a.dependents.length).toBe(0);
    expect(a.parents).toBe(null);
    endsWith<string>(a)(b);
    expect(b.parents).toBe(a);
  });
  it("subscribed Streams get ended by updates from the parent Stream", () => {
    const a = createStream<number>();
    const killer = createStream<string>();
    endsWith<string>(killer)(a);
    a(5)(6);
    expect(a.state).toBe(StreamState.ACTIVE);
    expect(killer.dependents[0][0]).toBe(a);
    killer("Do it!");
    expect(a.state).toBe(StreamState.CLOSED);
  });
});
