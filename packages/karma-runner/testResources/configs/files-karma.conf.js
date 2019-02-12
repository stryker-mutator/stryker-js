module.exports = function (config) {
  config.set({
    files: [
      'src/**/*.js',
      { pattern: 'resources/**/*.js', included: false }
    ],
    exclude: [
      '**/index.js',
      '+(Error|InfiniteAdd).js'
    ]
  });
};
