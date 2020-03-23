const Benchmark = require("benchmark");
const Rythe = require("../dist/cjs/index");
const rxjs = require("rxjs");
const rxOps = require("rxjs/operators");
const flyd = require("flyd");
const utils = require("./utils");

const suite1 = new Benchmark.Suite();

let output;

const defineRytheMap = () => {
  const stream = Rythe.createStream();
  stream.pipe(
    Rythe.map((value) => value + 1),
    Rythe.map((value) => value ** 2),
    Rythe.map((value) => value * 3)
  );
  return stream;
};

const defineSubjectMap = () => {
  const subject = new rxjs.Subject();
  const out = subject.pipe(
    rxOps.map((value) => value + 1),
    rxOps.map((value) => value ** 2),
    rxOps.map((value) => value * 3)
  );
  out.subscribe((val) => {
    output = val;
  });
  return subject;
};

const defineStreamMap = () => {
  const stream = flyd.stream();
  stream
    .map((value) => value + 1)
    .map((value) => value ** 2)
    .map((value) => value * 3);
  return stream;
};

const mappedRythe = defineRytheMap();
const mappedSubject = defineSubjectMap();
const mappedStream = defineStreamMap();

console.log("\nDefining Maps");
suite1
  .add("Map Rythe Stream", () => {
    defineRytheMap();
  })
  .add("Map Subject", () => {
    defineSubjectMap();
  })
  .add("Map Flyd Stream", () => {
    defineStreamMap();
  })
  .on("cycle", (ev) => console.log(ev.target.toString()))
  .on("complete", function () {
    utils.printFastest(this);
  })
  .run();

const suite2 = new Benchmark.Suite();

console.log("Updating Maps (3 Maps deep, invoked 2x)");
suite2
  .add("Update Mapped Rythe Stream", () => {
    mappedRythe(5)(6);
  })
  .add("Update Mapped Subject", () => {
    mappedSubject.next(5);
    mappedSubject.next(6);
  })
  .add("Update Mapped Flyd Stream", () => {
    mappedStream(5)(6);
  })
  .on("cycle", (ev) => console.log(ev.target.toString()))
  .on("complete", function () {
    utils.printFastest(this);
  })
  .run();
