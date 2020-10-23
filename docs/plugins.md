---
title: Plugins
custom_edit_url: https://github.com/stryker-mutator/stryker4s/edit/master/docs/plugins.md
---

Stryker supports several plugins, which are listed below. You can also [search npm for the stryker-plugin tag](https://www.npmjs.com/search?q=stryker-plugin).

Don't worry about the reporters if you're just starting. The needed plugins will be installed for you if you're following our [getting started](./getting-started.md).

Missing something? Feel free to create an [issue](https://github.com/stryker-mutator/stryker/issues) or

## Test runners

The test runner plugin is able to hook into your test runner to improve performance. If your test runner isn't listed here you can probably still use the
[command test runner](https://github.com/stryker-mutator/stryker/tree/master/packages/core#testrunner-string).

- Jasmine ([@stryker-mutator/jasmine-runner](https://github.com/stryker-mutator/stryker/tree/master/packages/jasmine-runner))
- Jest ([@stryker-mutator/jest-runner](https://github.com/stryker-mutator/stryker/tree/master/packages/jest-runner))
- Karma ([@stryker-mutator/karma-runner](https://github.com/stryker-mutator/stryker/tree/master/packages/karma-runner))
- Mocha ([@stryker-mutator/mocha-runner](https://github.com/stryker-mutator/stryker/tree/master/packages/mocha-runner))

Removed:

- Web Component Tester ([@stryker-mutator/wct-runner](https://github.com/stryker-mutator/stryker/tree/v3.3.1/packages/wct-runner)) (Removed in v4 of Stryker).

## Reporters

Stryker already has reporters build in:

- `progress`: Report progress during mutation testing.
- `dots`: Report progress as dots during mutation testing.
- `clear-text`: A clear text report at the end of the mutation testing phase.
- `event-recorder`: Write all events to disk. Useful for debug purposes (default location: 'reports/mutation/events')
- `html`: An html report. See [Stryker's own report](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker/master) for an example.
- `dashboard`: Upload your mutation testing report to the [Stryker dashboard](https://dashboard.stryker-mutator.io). See the [Stryker handbook for more info](https://github.com/stryker-mutator/stryker-handbook/blob/master/dashboard.md).

## \<Your plugin here\>

You can write your plugins for Stryker. Interested? Come and have a chat at [our Slack](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM).
