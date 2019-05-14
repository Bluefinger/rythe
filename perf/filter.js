const Benchmark = require("benchmark");
const CellStream = require("../dist/cjs/index");
const rxjs = require("rxjs");
const rxOps = require("rxjs/operators");
const flyd = require("flyd");
const flydFilter = require("flyd/module/filter");
const utils = require("./utils");

// CellStream.setDispatcher(CellStream.flatDispatcher);

let output;

const predicate = value => value % 2 !== 1;

const defineCellFilter = () => {
  const cell = CellStream.createCell();
  cell.pipe(CellStream.filter(predicate));
  return cell;
};

const defineSubjectFilter = () => {
  const subject = new rxjs.Subject();
  const out = subject.pipe(rxOps.filter(predicate));
  out.subscribe(val => {
    output = val;
  });
  return subject;
};

const defineStreamFilter = () => {
  const stream = flyd.stream();
  flydFilter(predicate, stream);
  return stream;
};

const filteredCell = defineCellFilter();
const filteredSubject = defineSubjectFilter();
const filteredStream = defineStreamFilter();

const suite1 = new Benchmark.Suite();

console.log("\nDefining Filters");
suite1
  .add("Filter Cell", () => {
    defineCellFilter();
  })
  .add("Filter Subject", () => {
    defineSubjectFilter();
  })
  .add("Filter Stream", () => {
    defineStreamFilter();
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .on("complete", function() {
    utils.printFastest(this);
  })
  .run();

const suite2 = new Benchmark.Suite();

console.log("Updating Filters");
suite2
  .add("Update Filtered Cell", () => {
    filteredCell(5)(4);
  })
  .add("Update Filtered Subject", () => {
    filteredSubject.next(5)
    filteredSubject.next(4);
  })
  .add("Update Filtered Stream", () => {
    filteredStream(5)(4);
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .on("complete", function() {
    utils.printFastest(this);
  })
  .run();
