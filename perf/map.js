const Benchmark = require("benchmark");
const CellStream = require("../dist/cjs/index");
const rxjs = require("rxjs");
const rxOps = require("rxjs/operators");
const flyd = require("flyd");
const utils = require("./utils");

// CellStream.setDispatcher(CellStream.flatDispatcher);

const suite1 = new Benchmark.Suite();

let output;

const defineCellMap = () => {
  const cell = CellStream.createCell();
  cell.pipe(
    CellStream.map(value => value + 1),
    CellStream.map(value => value ** 2),
    CellStream.map(value => value / 2)
  );
  return cell;
};

const defineSubjectMap = () => {
  const subject = new rxjs.Subject();
  const out = subject.pipe(
    rxOps.map(value => value + 1),
    rxOps.map(value => value ** 2),
    rxOps.map(value => value / 2)
  );
  out.subscribe(val => {
    output = val;
  });
  return subject;
};

const defineStreamMap = () => {
  const stream = flyd.stream();
  stream
    .map(value => value + 1)
    .map(value => value ** 2)
    .map(value => value / 2);
  return stream;
};

const mappedCell = defineCellMap();
const mappedSubject = defineSubjectMap();
const mappedStream = defineStreamMap();

console.log("Defining Maps");
suite1
  .add("Map Cell", () => {
    defineCellMap();
  })
  .add("Map Subject", () => {
    defineSubjectMap();
  })
  .add("Map Stream", () => {
    defineStreamMap();
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .on("complete", function() {
    utils.printFastest(this);
  })
  .run();

const suite2 = new Benchmark.Suite();

console.log("Updating Maps");
suite2
  .add("Update Mapped Cell", () => {
    mappedCell(5);
  })
  .add("Update Mapped Subject", () => {
    mappedSubject.next(5);
  })
  .add("Update Mapped Stream", () => {
    mappedStream(5);
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .on("complete", function() {
    utils.printFastest(this);
  })
  .run();
