const Benchmark = require("benchmark");
const Rythe = require("../dist/cjs/index");
const rxjs = require("rxjs");
const rxOps = require("rxjs/operators");
const flyd = require("flyd");
const flydFilter = require("flyd/module/filter");
const utils = require("./utils");

const suite1 = new Benchmark.Suite();

const combineAB = (sA, sB) => sA() + sB() + "c";
const combineBC = (sB, sC) => sB() + sC() + "e";
const combineDE = (sA, sD, sE) => sA() + sD() + sE() + "f";
const mapD = val => val + "d";

const liftAB = (a, b) => a + b + "c";
const liftBC = (b, c) => b + c + "e";
const liftDE = (a, d, e) => a + d + e + "f";

const conditionalABC = (sA, sB, sC) => sA() + sB() + sC();
const conditionalDEF = (d, e, f) => d + e + f;

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

const defineConditionalRythe = () => {
  const s = Rythe.createStream();
  const a = s.pipe(Rythe.filter(value => value % 2 === 0));
  const b = s.pipe(Rythe.filter(value => value < 3 || value > 4));
  const c = s.pipe(Rythe.filter(value => value !== 3));
  const o = Rythe.combine(conditionalABC, [a, b, c]);
  return { input: s, o };
};

const defineConditionalSubject = () => {
  const s = new rxjs.Subject();
  const d = s.pipe(rxOps.filter(value => value % 2 === 0));
  const e = s.pipe(rxOps.filter(value => value < 3 || value > 4));
  const f = s.pipe(rxOps.filter(value => value !== 3));
  const o = s.pipe(rxOps.combineLatest([d, e, f], conditionalDEF));
  o.subscribe(value => {
    output = value;
  });
  return { input: s, o };
};

const defineConditionalStream = () => {
  const s = flyd.stream();
  const a = flydFilter(value => value % 2 === 0, s);
  const b = flydFilter(value => value < 3 || value > 4, s);
  const c = flydFilter(value => value !== 3, s);
  const o = flyd.combine(conditionalABC, [a, b, c]);
  return { input: s, o };
};

const rytheObj = defineCombinedRythe();
const subjectObj = defineCombinedSubject();
const streamObj = defineCombinedStream();

const rytheConditional = defineConditionalRythe();
const subjectConditional = defineConditionalSubject();
const streamConditional = defineConditionalStream();

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

console.log("Resolving Conditional Combine Deps");
const suite3 = new Benchmark.Suite();
suite3
  .add("Combine Rythe Streams", () => {
    const { input } = rytheConditional;
    input(2)(3)(4)(5);
  })
  .add("Combine Subjects", () => {
    const { input } = subjectConditional;
    input.next(2);
    input.next(3);
    input.next(4);
    input.next(5);
  })
  .add("Combine Flyd Streams", () => {
    const { input } = streamConditional;
    input(2)(3)(4)(5);
  })
  .on("cycle", ev => console.log(ev.target.toString()))
  .on("complete", function() {
    utils.printFastest(this);
  })
  .run({ defer: true });
