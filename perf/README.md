# Performance tests

**Experimental**

Here you can find our performance tests. Run them with `npm run perf` from the root (after you've build with `npm run build`).

## Add new

You can add a new one simply
by adding it to the [test directory](https://github.com/stryker-mutator/stryker/tree/master/perf/test)

The package you add should have [local dependencies](https://github.com/nicojs/node-install-local#install-local) to
the Stryker packages you need.

The script that is run in your package is `stryker`, so that npm script should perform the actual performance test.

## Daily build

Performance tests are run for every daily build (once a day).
Right now, performance is only measured. The build doesn't break on thresholds (but we might introduce something like that later).
