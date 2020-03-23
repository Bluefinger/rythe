const Benchmark = require("benchmark");
const Rythe = require("../dist/cjs/index");
const rxjs = require("rxjs");
const rxOps = require("rxjs/operators");
const flyd = require("flyd");
const flydDrop = require("flyd/module/droprepeats").dropRepeats;
const utils = require("./utils");

let output;

const defineRytheDrop = () => {
  const stream = Rythe.createStream();
  stream.pipe(Rythe.dropRepeats);
  return stream;
};

const defineSubjectDrop = () => {
  const subject = new rxjs.Subject();
  const out = subject.pipe(rxOps.distinctUntilChanged());
  out.subscribe((val) => {
    output = val;
  });
  return subject;
};

const defineStreamDrop = () => {
  const stream = flyd.stream();
  flydDrop(stream);
  return stream;
};

const droppedRythe = defineRytheDrop();
const droppedSubject = defineSubjectDrop();
const droppedStream = defineStreamDrop();

const suite1 = new Benchmark.Suite();

console.log("\nDefining DropRepeats");
suite1
  .add("Drop Rythe Stream", () => {
    defineRytheDrop();
  })
  .add("Drop Subject", () => {
    defineSubjectDrop();
  })
  .add("Drop Flyd Stream", () => {
    defineStreamDrop();
  })
  .on("cycle", (ev) => console.log(ev.target.toString()))
  .on("complete", function () {
    utils.printFastest(this);
  })
  .run();

const suite2 = new Benchmark.Suite();

console.log("Updating DropRepeats");
suite2
  .add("Update Dropped Rythe Stream", () => {
    droppedRythe(5)(5)(6)(7)(7);
  })
  .add("Update Dropped Subject", () => {
    droppedSubject.next(5);
    droppedSubject.next(5);
    droppedSubject.next(6);
    droppedSubject.next(7);
    droppedSubject.next(7);
  })
  .add("Update Dropped Flyd Stream", () => {
    droppedStream(5)(5)(6)(7)(7);
  })
  .on("cycle", (ev) => console.log(ev.target.toString()))
  .on("complete", function () {
    utils.printFastest(this);
  })
  .run();
