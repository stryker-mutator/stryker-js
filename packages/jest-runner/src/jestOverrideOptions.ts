const JEST_OVERRIDE_OPTIONS = Object.freeze({
  // Prevent the user from using his or her own testResultProcessor because this might
  // Mess with the way Stryker gets the results
  testResultsProcessor: undefined,

  // Disable code coverage, it is not used in Stryker and will only slow down the test runs
  collectCoverage: false,

  // Disable verbose logging, this will only slow down Stryker test runs
  verbose: false,

  // Disable bail so the jest process does not quit with a non-zero exit code
  bail: false,

  // Disable notifications for test results, this will otherwise show a notification about
  // the results each time Stryker runs the tests
  notify: false
});

export default JEST_OVERRIDE_OPTIONS;
