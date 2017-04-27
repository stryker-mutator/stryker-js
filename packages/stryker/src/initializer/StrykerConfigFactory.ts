export default class StrykerConfigFactory {
  static default() {
    return {
      files: [
        { pattern: 'src/**/*.js', mutated: true, included: false },
        'test/**/*.js'
      ],
      coverageAnalysis: 'perTest',
      reporter: ['html', 'progress'],
    };
  }
}