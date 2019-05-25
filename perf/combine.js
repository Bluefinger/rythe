const Benchmark = require("benchmark");
const Rythe = require("../dist/cjs/index");
const rxjs = require("rxjs");
const rxOps = require("rxjs/operators");
const flyd = require("flyd");
const utils = require("./utils");

const suite1 = new Benchmark.Suite();

const combineAB = (sA, sB) => sA() + sB() + "c";
const combineBC = (sB, sC) => sB() + sC() + "e";
const combineDE = (sA, sD, sE) => sA() + sD() + sE() + "f";
const mapD = val => val + "d";

const liftAB = (a, b) => a + b + "c";
const liftBC = (b, c) => b + c + "e";
const liftDE = (a, d, e) => a + d + e + "f";

let output;

const defineCombinedRythe = () => {
  const cA = Rythe.createStream();
  const cB = Rythe.createStream();
  const sources = [cA, cB];
  const cC = Rythe.combine(combineAB, sources);
  const cD = cC.pipe(Rythe.map(mapD));
  const cE = Rythe.combine(combineBC, [cB, cC]);
  const cF = Rythe.combine(combineDE, [cA, cD, cE]);
  return { inputs: sources, output: cF };
};

const defineCombinedSubject = () => {
  const rA = new rxjs.Subject();
  const rB = new rxjs.Subject();
  const sources = [rA, rB];
  const rC = rxjs.combineLatest(sources, liftAB);
  const rD = rC.pipe(rxOps.map(mapD));
  const rE = rxjs.combineLatest([rB, rC], liftBC);
  const rF = rxjs.combineLatest([rA, rD, rE], liftDE);
  rF.subscribe(val => {
    output = val;
  });
  return { inputs: sources, output: rF };
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

const rytheObj = defineCombinedRythe();
const subjectObj = defineCombinedSubject();
const streamObj = defineCombinedStream();

console.log("\nDefining Complex Combine Deps");
suite1
  .add("Combine Rythe Streams", defineCombinedRythe)
  .add("Combine Subjects", defineCombinedSubject)
  .add("Combine Flyd Streams", defineCombinedStream)
  .on("cycle", ev => console.log(ev.target.toString()))
  .on("complete", function() {
    utils.printFastest(this);
  })
  .run();

console.log("Resolving Complex Combine Deps");
const suite2 = new Benchmark.Suite();
suite2
  .add("Combine Rythe Streams", () => {
    const [a, b] = rytheObj.inputs;
    a("a");
    b("b");
    a("A");
  })
  .add("Combine Subjects", () => {
    const [a, b] = subjectObj.inputs;
    a.next("a");
    b.next("b");
    a.next("A");
  })
  .add("Combine Flyd Streams", () => {
    const [a, b] = streamObj.inputs;
    a("a");
    b("b");
    a("A");
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .on("complete", function() {
    utils.printFastest(this);
  })
  .run({ defer: true });
