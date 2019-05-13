const Benchmark = require("benchmark");
const CellStream = require("../dist/cjs/index");
const flyd = require("flyd");
const utils = require("./utils");

const combineAB = (sA, sB) => sA() + sB() + "c";
const combineBC = (sB, sC) => sB() + sC() + "e";
const combineDE = (sA, sD, sE) => sA() + sD() + sE() + "f";
const mapD = val => val + "d";

const defineCombinedCell = () => {
  const cA = CellStream.createCell();
  const cB = CellStream.createCell();
  const sources = [cA, cB];
  const cC = CellStream.combine(combineAB, sources);
  const cD = cC.pipe(CellStream.map(mapD));
  const cE = CellStream.combine(combineBC, [cB, cC]);
  const cF = CellStream.combine(combineDE, [cA, cD, cE]);
  return { inputs: sources, output: cF };
};

const defineCellMap = () => {
  const cell = CellStream.createCell();
  cell.pipe(
    CellStream.map(value => value + "1"),
    CellStream.map(value => value + "2"),
    CellStream.map(value => value + "3")
  );
  return cell;
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
    .map(value => value + "1")
    .map(value => value + "2")
    .map(value => value + "3");
  return stream;
};

const combinedCell = defineCombinedCell();
const mappedCell = defineCellMap();

const combinedStream = defineCombinedStream();
const mappedStream = defineStreamMap();

const suite1 = new Benchmark.Suite();

CellStream.setDispatcher(CellStream.recursiveDispatcher);
console.log("\nDefault Cell Dispatcher");
suite1
  .add("Mapped Cells (3 inputs)", () => mappedCell("5")("7")("8"))
  .add("Combined Cells (4 inputs)", () => {
    const [a, b] = combinedCell.inputs;
    a("a");
    b("b")("B");
    a("A");
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .run();

const suite2 = new Benchmark.Suite();

console.log("\nQueued Cell Dispatcher");
CellStream.setDispatcher(CellStream.flatDispatcher);
suite2
  .add("Mapped Cells (3 inputs)", () => mappedCell("5")("7")("8"))
  .add("Combined Cells (4 inputs)", () => {
    const [a, b] = combinedCell.inputs;
    a("a");
    b("b")("B");
    a("A");
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .run();

const suite3 = new Benchmark.Suite();

console.log("\nFlyd Comparison (uses Queue based resolution)");
suite3
  .add("Mapped Cells (3 inputs)", () => mappedStream("5")("7")("8"))
  .add("Combined Cells (4 inputs)", () => {
    const [a, b] = combinedStream.inputs;
    a("a");
    b("b")("B");
    a("A");
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .run();
