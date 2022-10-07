import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import ts from "typescript";

const packageJson = require("./package.json");

const globals = {
  ...packageJson.devDependencies,
};

export default {
  input: "index.ts",
  output: [
    {
      file: "build/index.js",
      format: "cjs",
      sourcemap: true,
      preserveModules: true,
    },
    {
      file: "build/index.es.js",
      format: "esm",
      sourcemap: true,
      preserveModules: true,
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({
      typescript: ts,
    }),
    commonjs({
      exclude: "node_modules",
      ignoreGlobal: true,
    }),
  ],
  external: Object.keys(globals),
};
