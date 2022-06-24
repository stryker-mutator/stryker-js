[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fstryker-mutator%2Fstryker-js%2Fmaster%3Fmodule%3Dapi)](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker-js/master?module=api)
[![Build Status](https://github.com/stryker-mutator/stryker-js/workflows/CI/badge.svg)](https://github.com/stryker-mutator/stryker-js/actions?query=workflow%3ACI+branch%3Amaster)
[![Slack Chat](https://img.shields.io/badge/slack-chat-brightgreen.svg?logo=slack)](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM)

![Stryker](https://github.com/stryker-mutator/stryker-js/raw/master/stryker-80x80.png)

# StrykerJS API
This is the repository for maintaining the API of the [StrykerJS](https://stryker-mutator.io/) mutation testing framework.
Plugin creators should depend on this API rather than on the main Stryker repository directly.

# Extension use cases
You can extend Stryker in a number of ways.

1. Create your own `Mutator`
2. Create a custom `Reporter`
3. Create a `TestFramework` for a test framework
4. Create a `TestRunner` to bridge the gap between your test runner and Stryker
5. Create a custom way of configuring Stryker by creating an `OptionsEditor`

All extension points work in the same basic way.

1. Create a `constructor function` (or `class`)
2. Register the `constructor function` to the correct `Factory`.

For more info, please take a look at the [Stryker website section on plugins](https://stryker-mutator.io/docs/stryker-js/plugins).
