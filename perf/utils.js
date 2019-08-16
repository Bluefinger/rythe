const Benchmark = require("benchmark");

function getHz(bench) {
  // hz adjusted for margin of error
  const result = 1 / (bench.stats.mean + bench.stats.moe);
  return isFinite(result) ? result : 0;
}

exports.printFastest = function(suite) {
  const formatNumber = Benchmark.formatNumber,
    fastest = suite.filter("fastest"),
    fastestHz = getHz(fastest[0]),
    slowest = suite.filter("slowest"),
    slowestHz = getHz(slowest[0]);
  const percent = (fastestHz / slowestHz - 1) * 100;
  console.log(
    "\n" +
      fastest[0].name +
      " is " +
      formatNumber(percent < 1 ? percent.toFixed(2) : Math.round(percent)) +
      "% faster than the slowest.\n"
  );
};
