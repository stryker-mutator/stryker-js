require('ts-node').register({
  transpileOnly: true,
  skipProject: true,
  compilerOptions: {
    module: "commonjs",
    skipLibCheck: true,
  },
});
