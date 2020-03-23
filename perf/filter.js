const Benchmark = require("benchmark");
const Rythe = require("../dist/cjs/index");
const rxjs = require("rxjs");
const rxOps = require("rxjs/operators");
const flyd = require("flyd");
const flydFilter = require("flyd/module/filter");
const utils = require("./utils");

let output;

const predicate = (value) => value % 2 !== 1;

const defineRytheFilter = () => {
  const stream = Rythe.createStream();
  stream.pipe(Rythe.filter(predicate));
  return stream;
};

const defineSubjectFilter = () => {
  const subject = new rxjs.Subject();
  const out = subject.pipe(rxOps.filter(predicate));
  out.subscribe((val) => {
    output = val;
  });
  return subject;
};

const defineStreamFilter = () => {
  const stream = flyd.stream();
  flydFilter(predicate, stream);
  return stream;
};

const filteredRythe = defineRytheFilter();
const filteredSubject = defineSubjectFilter();
const filteredStream = defineStreamFilter();

const suite1 = new Benchmark.Suite();

console.log("\nDefining Filters");
suite1
  .add("Filter Rythe Stream", () => {
    defineRytheFilter();
  })
  .add("Filter Subject", () => {
    defineSubjectFilter();
  })
  .add("Filter Flyd Stream", () => {
    defineStreamFilter();
  })
  .on("cycle", (ev) => console.log(ev.target.toString()))
  .on("complete", function () {
    utils.printFastest(this);
  })
  .run();

const suite2 = new Benchmark.Suite();

console.log("Updating Filters");
suite2
  .add("Update Filtered Rythe Stream", () => {
    filteredRythe(5)(4);
  })
  .add("Update Filtered Subject", () => {
    filteredSubject.next(5);
    filteredSubject.next(4);
  })
  .add("Update Filtered Flyd Stream", () => {
    filteredStream(5)(4);
  })
  .on("cycle", (ev) => console.log(ev.target.toString()))
  .on("complete", function () {
    utils.printFastest(this);
  })
  .run();
