const Benchmark = require("benchmark");
const Rythe = require("../dist/cjs/index");
const rxjs = require("rxjs");
const rxOps = require("rxjs/operators");
const flyd = require("flyd");
const utils = require("./utils");

// Rythe.setDispatcher(Rythe.flatDispatcher);

let output;

const accumulator = (acc, value) => acc + value;

const defineRytheScan = () => {
  const stream = Rythe.createStream();
  stream.pipe(Rythe.scan(accumulator, 0));
  return stream;
};

const defineSubjectScan = () => {
  const subject = new rxjs.Subject();
  const out = subject.pipe(rxOps.scan(accumulator, 0));
  out.subscribe(val => {
    output = val;
  });
  return subject;
};

const defineStreamScan = () => {
  const stream = flyd.stream();
  flyd.scan(accumulator, 0, stream);
  return stream;
};

const scannedRythe = defineRytheScan();
const scannedSubject = defineSubjectScan();
const scannedStream = defineStreamScan();

const suite1 = new Benchmark.Suite();

console.log("\nDefining Scans");
suite1
  .add("Scan Rythe Stream", () => {
    defineRytheScan();
  })
  .add("Scan Subject", () => {
    defineSubjectScan();
  })
  .add("Scan Flyd Stream", () => {
    defineStreamScan();
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .on("complete", function() {
    utils.printFastest(this);
  })
  .run();

const suite2 = new Benchmark.Suite();

console.log("Updating Scans");
suite2
  .add("Update Scanned Rythe Stream", () => {
    scannedRythe(5)(6);
  })
  .add("Update Scanned Subject", () => {
    scannedSubject.next(5);
    scannedSubject.next(6);
  })
  .add("Update Scanned Flyd Stream", () => {
    scannedStream(5)(6);
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .on("complete", function() {
    utils.printFastest(this);
  })
  .run();
