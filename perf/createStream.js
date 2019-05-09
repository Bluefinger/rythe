const Benchmark = require("benchmark");
const CellStream = require("../dist/cjs/index");
const rxjs = require("rxjs");
const flyd = require("flyd");
const utils = require("./utils");

const suite = new Benchmark.Suite();

console.log("Stream Creation\n");

suite
  .add("Create Cell", () => {
    CellStream.createCell();
  })
  .add("Create Subject", () => {
    rxjs.Subject();
  })
  .add("Create Stream", () => {
    flyd.stream();
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .on("complete", function() {
    utils.printFastest(this);
  })
  .run();
