const Benchmark = require("benchmark");
const Rythe = require("../dist/cjs/index");
const rxjs = require("rxjs");
const flyd = require("flyd");
const utils = require("./utils");

const suite = new Benchmark.Suite();

console.log("Stream Creation\n");
let output;

suite
  .add("Create Rythe Stream", () => {
    Rythe.createStream();
  })
  .add("Create Subject", () => {
    new rxjs.Subject().subscribe(val => (output = val));
  })
  .add("Create Flyd Stream", () => {
    flyd.stream();
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .on("complete", function() {
    utils.printFastest(this);
  })
  .run();
