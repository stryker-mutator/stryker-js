
const results = [];
jasmine.getEnv().clearReporters();
jasmine.getEnv().addReporter({

  specDone(result) {
    results.push(result);
  },

  jasmineDone() {
    console.log(JSON.stringify(results));
  }
});
