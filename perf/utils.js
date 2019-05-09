const Benchmark = require("benchmark");

function getHz(bench) {
  // hz adjusted for margin of error
  const result = 1 / (bench.stats.mean + bench.stats.moe);
  return isFinite(result) ? result : 0;
}

exports.printFastest = function(suite) {
  var formatNumber = Benchmark.formatNumber,
    fastest = suite.filter("fastest"),
    fastestHz = getHz(fastest[0]),
    slowest = suite.filter("slowest"),
    slowestHz = getHz(slowest[0]);
  if (fastest.length > 1) {
    console.log("It's too close to call.");
  } else {
    const percent = (fastestHz / slowestHz - 1) * 100;
    console.log(
      "\n" +
        fastest[0].name +
        " is " +
        formatNumber(percent < 1 ? percent.toFixed(2) : Math.round(percent)) +
        "% faster.\n"
    );
  }
};
