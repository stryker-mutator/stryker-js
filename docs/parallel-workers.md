---
title: Parallel Workers
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/parallel-workers.md
---

Stryker will always run checkers and test runners in parallel by creating worker processes (note, not `worker_threads`). The number of such processes forked is determined by the configuration option [`--concurrency`](./configuration.md#concurrency-number). 

However, imagine running these parallel processes on a test suite which uses resources like a database connection, web server or file system. This means these processes can conflict if they write to the same database, file or utilize the same port. To solve this problem, Stryker sets a unique number (starting from 0 and incremented by 1) to each worker's environment variable `STRYKER_MUTATOR_WORKER`. This variable can be utilized to distribute the resources without conflicts - for instance, by setting the server port to `4444 + (+process.env.STRYKER_MUTATOR_WORKER)` instead of `4444`. 