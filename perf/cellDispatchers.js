const Benchmark = require("benchmark");
const Rythe = require("../dist/cjs/index");
const flyd = require("flyd");

const combineAB = (sA, sB) => sA() + sB() + 4;
const combineBC = (sB, sC) => sB() + sC() * 5;
const combineDE = (sA, sD, sE) => sA() + sD() + sE() - 1;
const mapD = val => val + 1;

const defineCombinedRythe = () => {
  const cA = Rythe.createStream();
  const cB = Rythe.createStream();
  const sources = [cA, cB];
  const cC = Rythe.combine(combineAB, sources);
  const cD = cC.pipe(Rythe.map(mapD));
  const cE = Rythe.combine(combineBC, [cB, cC]);
  const cF = Rythe.combine(combineDE, [cA, cD, cE]);
  return { inputs: sources, output: cF };
};

const defineCellMap = () => {
  const stream = Rythe.createStream();
  stream.pipe(
    Rythe.map(value => value + 1),
    Rythe.map(value => value * 2),
    Rythe.map(value => value ** 3)
  );
  return stream;
};

const defineCombinedStream = () => {
  const sA = flyd.stream();
  const sB = flyd.stream();
  const sources = [sA, sB];
  const sC = flyd.combine(combineAB, sources);
  const sD = sC.map(mapD);
  const sE = flyd.combine(combineBC, [sB, sC]);
  const sF = flyd.combine(combineDE, [sA, sD, sE]);
  return { inputs: sources, output: sF };
};

const defineStreamMap = () => {
  const stream = flyd.stream();
  stream
    .map(value => value + 1)
    .map(value => value * 2)
    .map(value => value ** 3);
  return stream;
};

const combinedRythe = defineCombinedRythe();
const mappedRythe = defineCellMap();

const combinedStream = defineCombinedStream();
const mappedStream = defineStreamMap();

const suite1 = new Benchmark.Suite();

Rythe.setDispatcher(Rythe.recursiveDispatcher);
console.log("\nDefault Stream Dispatcher");
suite1
  .add("Mapped Streams (3 inputs)", () => mappedRythe(5)(7)(8))
  .add("Combined Streams (4 inputs)", () => {
    const [a, b] = combinedRythe.inputs;
    a(2);
    b(3)(4);
    a(5);
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .run();

const suite2 = new Benchmark.Suite();

console.log("\nQueued Stream Dispatcher");
Rythe.setDispatcher(Rythe.flatDispatcher);
suite2
  .add("Mapped Streams (3 inputs)", () => mappedRythe(5)(7)(8))
  .add("Combined Streams (4 inputs)", () => {
    const [a, b] = combinedRythe.inputs;
    a(2);
    b(3)(4);
    a(5);
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .run();

const suite3 = new Benchmark.Suite();

console.log("\nFlyd Comparison (uses Queue based resolution)");
suite3
  .add("Mapped Streams (3 inputs)", () => mappedStream(5)(7)(8))
  .add("Combined Streams (4 inputs)", () => {
    const [a, b] = combinedStream.inputs;
    a(2);
    b(3)(4);
    a(5);
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .run();
