const Benchmark = require("benchmark");
const CellStream = require("../dist/cjs/index");
const rxjs = require("rxjs");
const rxOps = require("rxjs/operators");
const flyd = require("flyd");
const flydDrop = require("flyd/module/droprepeats").dropRepeats;
const utils = require("./utils");

// CellStream.setDispatcher(CellStream.flatDispatcher);

let output;

const defineCellDrop = () => {
  const cell = CellStream.createCell();
  cell.pipe(CellStream.dropRepeats);
  return cell;
};

const defineSubjectDrop = () => {
  const subject = new rxjs.Subject();
  const out = subject.pipe(rxOps.distinctUntilChanged());
  out.subscribe(val => {
    output = val;
  });
  return subject;
};

const defineStreamDrop = () => {
  const stream = flyd.stream();
  flydDrop(stream);
  return stream;
};

const droppedCell = defineCellDrop();
const droppedSubject = defineSubjectDrop();
const droppedStream = defineStreamDrop();

const suite1 = new Benchmark.Suite();

console.log("\nDefining DropRepeats");
suite1
  .add("Drop Cell", () => {
    defineCellDrop();
  })
  .add("Drop Subject", () => {
    defineSubjectDrop();
  })
  .add("Drop Stream", () => {
    defineStreamDrop();
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .on("complete", function() {
    utils.printFastest(this);
  })
  .run();

const suite2 = new Benchmark.Suite();

console.log("Updating DropRepeats");
suite2
  .add("Update Dropped Cell", () => {
    droppedCell(5)(5)(6)(7)(7);
  })
  .add("Update Dropped Subject", () => {
    droppedSubject.next(5);
    droppedSubject.next(5);
    droppedSubject.next(6);
    droppedSubject.next(7);
    droppedSubject.next(7);
  })
  .add("Update Dropped Stream", () => {
    droppedStream(5)(5)(6)(7)(7);
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .on("complete", function() {
    utils.printFastest(this);
  })
  .run();
