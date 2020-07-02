import { createStream } from "../src/stream";
import * as dispatch from "../src/dispatcher";
import { combine, map, merge, scan } from "../src/operators";
import { emitEND, emitSKIP } from "../src/signal";
import { test } from "./testHarness";
import { spy, SinonSpy } from "sinon";

const spyDispatcher = () => spy(dispatch, "dispatcher");

const cleanSpy = (spied: SinonSpy) => spied.restore();

test("Dispatcher - can update streams", (assert) => {
  const dispatched = spyDispatcher();
  const a = createStream<number>();
  const b = a.pipe(map((val) => (val === 8 ? emitSKIP() : val + 1)));
  a(5)(8);
  assert.equal(
    dispatched.callCount,
    2,
    "Dispatcher is called twice, once per update"
  );
  assert.equal(b(), 6, "Dependent stream is updated with the correct value");
  cleanSpy(dispatched as any);
});

test("Dispatcher - can close streams with an END signal", (assert) => {
  const dispatched = spyDispatcher();
  const a = createStream<number>(5);
  const b = a.pipe(map((val) => val + 1));
  assert.equal(
    dispatched.callCount,
    2,
    "Dispatcher called twice as each initial value propagates down the defined dependencies"
  );
  dispatched.resetHistory();
  a(emitEND());
  assert.equal(
    dispatched.callCount,
    2,
    "Dispatcher is called twice as END signal is caught in the internal NEXT function and propagated to the internal COMPLETE function"
  );
  dispatched.resetHistory();
  a(6);
  assert.equal(
    dispatched.callCount,
    1,
    "One update invokes one call of the dispatcher"
  );
  assert.equal(
    b(),
    6,
    "Dependent Stream keeps original value after parent stream is ended"
  );
  cleanSpy(dispatched as any);
});

test("Dispatcher - combines complicated stream dependencies atomically", (assert) => {
  const dispatched = spyDispatcher();
  const a = createStream<string>();
  const b = createStream<string>();
  const c = combine((sA, sB) => sA() + sB() + "c", a, b);
  const d = map<string>((val) => val + "d")(c);
  const e = combine((sB, sC) => sB() + sC() + "e", b, c);
  const atomic = combine((sD, sE) => sD() + sE() + "f", d, e).pipe(
    scan((acc, value: string) => acc.concat(value), [] as string[])
  );

  // Should invoke once once there are no streams pending values
  a("c")("a");
  b("b");
  assert.equal(
    dispatched.callCount,
    4,
    "Four updates yield four dispatcher calls, one being the initial scan emit"
  );
  assert.deepEqual(
    atomic(),
    ["abcdbabcef"],
    "Combine should only yield one result when all parent streams are no longer PENDING"
  );
  dispatched.resetHistory();
  atomic().length = 0;
  a("A");
  b("B");
  a("");
  assert.deepEqual(
    atomic(),
    ["AbcdbAbcef", "ABcdBABcef", "BcdBBcef"],
    "Combine should yield one emit per update now all parent streams are no longer PENDING"
  );
  assert.equal(
    dispatched.callCount,
    atomic().length,
    "Dispatcher calls should equal combine results length"
  );
  cleanSpy(dispatched as any);
});

test("Dispatcher - mixed immediate and non-immediate parent streams resolve to dependents correctly", (assert) => {
  const a = createStream<number>();
  const b = createStream<string>();
  const c = createStream<number>();
  const d = createStream<string>();

  const c1 = combine((s1, s2) => `${s1()}${s2()}`, a, b);
  const m1 = merge(c, d);

  const m2 = merge(c1, m1);
  const spyFn = spy((n: number | string) => n);
  const spied = m2.pipe(map(spyFn));

  a(1);
  assert.equal(spyFn.callCount, 0, "dependent hasn't emitted yet");
  c(4);
  assert.equal(spyFn.callCount, 1, "dependent only emitted once");
  assert.equal(spied(), 4, "number value had been routed correctly");

  b("B");
  a(2);
  assert.equal(spyFn.callCount, 3, "dependent emitted total of three times");
  assert.equal(spied(), "2B", "string value had been routed correctly");
  assert.equal(m2.waiting, -1, "waiting was not modified");
});
