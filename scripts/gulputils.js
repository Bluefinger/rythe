const { existsSync, promises } = require("fs");
const { readFile, writeFile, mkdir } = promises;
const { parse, stringify } = require("buffer-json");
const { exec } = require("child_process");

const CACHE_LOCATION = "./node_modules/.cache";
const CACHE_FILE = `${CACHE_LOCATION}/.rollup.cache.json`;

const linkChildOutput = (childProcess) => {
  childProcess.stdout.pipe(process.stdout);
  childProcess.stderr.pipe(process.stderr);
  return childProcess;
};

const createChildTask = (cmd) => linkChildOutput(exec(cmd));

const readCache = async () => {
  try {
    const file = await readFile(CACHE_FILE, "utf-8");
    return parse(file);
  } catch (e) {
    if (!existsSync(CACHE_LOCATION)) return mkdir(CACHE_LOCATION);
  }
};

const saveCache = (result) => writeFile(CACHE_FILE, stringify(result));

exports.createChildTask = createChildTask;
exports.readCache = readCache;
exports.saveCache = saveCache;
