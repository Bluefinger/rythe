import typescript from "rollup-plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default {
  input: ["./src/index.ts"],
  plugins: [
    typescript({
      tsconfig: "./config/tsconfig.umd.json"
    }),
    terser({
      output: {
        ecma: 5
      }
    })
  ],
  output: {
    file: "./dist/umd/rythe.min.js",
    format: "umd",
    name: "rythe",
    sourcemap: true
  }
};
