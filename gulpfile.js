/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const gulp = require("gulp");
const sourceMaps = require("gulp-sourcemaps");
const ts = require("gulp-typescript");
const rollup = require("rollup");
const typescript = require("rollup-plugin-typescript2");
const terser = require("rollup-plugin-terser").terser;
const babel = require("rollup-plugin-babel");
const del = require("del");
const tslint = require("gulp-tslint");
const jest = require("jest-cli");
const merge = require("merge-stream");

const paths = {
  scripts: {
    src: ["./src/**/*.ts", "!./src/__tests__/**/*"],
    dest: "./dist/**/*"
  }
};

const jestConf = {
  silent: false,
  colors: true
};

const babelConfig = {
  extensions: [".ts", ".js"]
};

const projectES = ts.createProject("./config/tsconfig.esm.json");
const projectCJS = ts.createProject("./config/tsconfig.cjs.json");

const jestResolve = ({ results }) =>
  results.success ? Promise.resolve() : Promise.reject();

const fullTest = () =>
  jest
    .runCLI({ ...jestConf, all: true, coverage: true }, ["./src"])
    .then(jestResolve);

const quickTest = () =>
  jest.runCLI({ ...jestConf, onlyChanged: true }, ["./src"]).then(jestResolve);

const clean = () => del(paths.scripts.dest);

const lint = () =>
  gulp
    .src(paths.scripts.src)
    .pipe(tslint({ formatter: "stylish" }))
    .pipe(
      tslint.report({
        allowWarnings: true,
        emitError: true,
        summarizeFailureOutput: true
      })
    );

const bundle = async () => {
  try {
    const legacy = await rollup.rollup({
      input: ["./src/index.ts"],
      plugins: [
        typescript(),
        babel(babelConfig),
        terser({
          output: {
            ecma: 5
          }
        })
      ]
    });

    return await legacy.write({
      file: "./dist/umd/index.min.js",
      format: "umd",
      name: "cellstream",
      sourcemap: true
    });
  } catch (error) {
    return Promise.reject(error.message);
  }
};

const tsReporter = ts.reporter.longReporter();

const compile = () => {
  const sources = gulp.src(paths.scripts.src).pipe(sourceMaps.init());
  const esm = sources.pipe(projectES(tsReporter));
  const cjs = sources.pipe(projectCJS(tsReporter));

  return merge(
    cjs.pipe(sourceMaps.write("./maps")).pipe(gulp.dest("./dist/cjs")),
    esm.pipe(sourceMaps.write("./maps")).pipe(gulp.dest("./dist/esm"))
  );
};

const watcher = () => {
  gulp.watch(paths.scripts.src, gulp.series(lint, quickTest, compile));
};

gulp.task("build", gulp.series(clean, lint, fullTest, gulp.parallel(compile, bundle)));

gulp.task("test", fullTest);

gulp.task(
  "dev-build",
  gulp.series(clean, lint, gulp.parallel(compile, bundle))
);

gulp.task("watch", gulp.series("build", watcher));
