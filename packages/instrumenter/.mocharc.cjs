module.exports = {
  require: ['dist/test/setup.js'],
  spec: [
    'dist/test/unit/**/*.js',
    'dist/test/integration/**/*.js',
    // See 
    // 'dist/test/perf/**/*.js', 
  ],
  timeout: 10000,
  forbidOnly: Boolean(process.env.CI),
};
