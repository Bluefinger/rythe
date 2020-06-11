const { series, parallel } = require("gulp");
const { rollup, watch: rollupWatch } = require("rollup");
const { existsSync, promises } = require("fs");
const { readFile, writeFile, mkdir } = promises;
const del = require("del");
const { parse, stringify } = require("buffer-json");
const { terser } = require("rollup-plugin-terser");
const sucrase = require("@rollup/plugin-sucrase");
const madge = require("madge");
const { exec } = require("child_process");
const log = require("fancy-log");

const tasks = {
  watch: "tsc --build tests/tsconfig.json --pretty --watch",
  typingWithConfig: (config) => `tsc --build ${config} --pretty`,
  linting: 'eslint "./+(src|tests|perf)/**/*.{ts,js}"',
  documentation: 'prettier --check "./documentation/**/*.md"',
  unitTests: "nyc npm run test:tape",
};

const beautified = [
  terser({
    ecma: 2017,
    compress: false,
    mangle: false,
    output: {
      indent_level: 2,
      quote_style: 3,
      beautify: true,
    },
  }),
];

const compressed = [
  terser({
    ecma: 2017,
    compress: {
      passes: 3,
    },
  }),
];

const inputOptions = {
  input: ["./src/index.ts"],
  plugins: [
    sucrase({
      transforms: ["typescript"],
    }),
  ],
};

const outputOptions = [
  {
    file: "./dist/esm/index.js",
    format: "esm",
    sourcemap: true,
    plugins: beautified,
  },
  {
    file: "./dist/cjs/index.js",
    format: "cjs",
    sourcemap: true,
    plugins: beautified,
  },
  {
    file: "./dist/umd/rythe.min.js",
    format: "umd",
    name: "rythe",
    sourcemap: true,
    plugins: compressed,
  },
];

const watchOptions = {
  ...inputOptions,
  output: outputOptions,
  watch: {
    buildDelay: 100,
    exclude: "node_modules/**",
    skipWrite: true,
  },
};

const CACHE_LOCATION = "./node_modules/.cache";
const CACHE_FILE = `${CACHE_LOCATION}/.rollup.cache.json`;
let cache;

const linkChildOutput = (childProcess) => {
  childProcess.stdout.pipe(process.stdout);
  childProcess.stderr.pipe(process.stderr);
  return childProcess;
};

const createChildTask = (cmd) => linkChildOutput(exec(cmd));

const loadCache = async () => {
  try {
    const file = await readFile(CACHE_FILE, "utf-8");
    cache = parse(file);
  } catch (e) {
    if (!existsSync(CACHE_LOCATION)) return mkdir(CACHE_LOCATION);
  }
};

const saveCache = (result) => writeFile(CACHE_FILE, stringify(result));

const clean = () => del(["./{dist,types}/*"]);

const generateBundle = async () => {
  inputOptions.cache = cache;
  const bundle = await rollup(inputOptions);
  const writing = outputOptions.map(bundle.write);
  await Promise.all([saveCache(bundle.cache), ...writing]);
};

const watchSources = () => {
  watchOptions.cache = cache;
  const bundle = rollupWatch(watchOptions);
  bundle.on("event", (event) => {
    if (event.code === "BUNDLE_END") {
      log(`Bundle generated in ${event.duration} ms. Updating build cache...`);
      cache = event.result.cache;
      saveCache(cache).catch(log.error);
    }
  });
  createChildTask(tasks.watch);
};

const dependencies = async () => {
  const res = await madge("./src/index.ts", {
    tsConfig: "./tsconfig.json",
  });
  const circular = res.circular();
  if (circular.length) {
    log.error(`Circular dependencies:\n${circular.join("\n")}`);
    throw new Error("Dependency check failed!");
  } else {
    log("Dependency check passed! No circular dependencies.");
  }
};

const generateTypes = () =>
  createChildTask(tasks.typingWithConfig("config/tsconfig.typings.json"));
const checkTypes = () =>
  createChildTask(tasks.typingWithConfig("tests/tsconfig.json"));
const documentation = () => createChildTask(tasks.documentation);
const linting = () => createChildTask(tasks.linting);
const unitTests = () => createChildTask(tasks.unitTests);

const setup = parallel(clean, loadCache);
const build = parallel(generateBundle, generateTypes);

exports.clean = clean;
exports.build = series(loadCache, build);
exports.prepare = series(setup, build);
exports.watch = series(loadCache, watchSources);
exports.test = parallel(
  dependencies,
  documentation,
  linting,
  unitTests,
  checkTypes
);
