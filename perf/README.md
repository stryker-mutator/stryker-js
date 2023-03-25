# Performance tests

**Experimental**

Inside the `perf/test` directory you'll find some performance tests for Stryker in different use cases.
We're using [git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules) to clone (some of them) directly
from github.

## Setup

1. Clone the Stryker mono repo
2. Build the code. (`npm run build`). Makes sure there are no build errors.
3. Checkout git submodules. For example:
    ```
    git submodule init 
    git submodule update
    ```
4. Run `npm run perf` from the root, or run `npm install && npm run test` in the `perf` dir.

## Add new

You can add a new one simply
by adding it to the [test directory](https://github.com/stryker-mutator/stryker-js/tree/master/perf/test)

The package you add should have [local dependencies](https://github.com/nicojs/node-install-local#install-local) to
the Stryker packages you need.

The script that is run in your package is `stryker`, so that npm script should perform the actual performance test.
