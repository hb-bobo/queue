import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'
import rollupTypescript from 'rollup-plugin-typescript2'

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/queue.js',
    format: 'umd',
    name: 'Queue'
  },
  plugins: [
    resolve(),
    rollupTypescript(),
    babel({
      exclude: 'node_modules/**' // only transpile our source code
    }),
    uglify(),
  ]
};