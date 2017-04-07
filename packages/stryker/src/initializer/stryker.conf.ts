const strykerConfig = {
  files: [
    { pattern: 'src/**/*.js', mutated: true, included: false },
    'test/**/*.js'
  ],
  coverageAnalysis: 'perTest',
  reporter: ['html', 'progress'],
};

export default strykerConfig;