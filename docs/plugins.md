---
title: Plugins
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/plugins.md
---

Stryker supports several plugins, which are listed below. You can also [search npm for the stryker-plugin tag](https://www.npmjs.com/search?q=stryker-plugin).

Test runner and checker plugins are packaged separately; you should install them yourself. For example, if you want to use the mocha test runner you can run `npm install -D @stryker-mutator/mocha-runner`.

Don't worry about plugins if you're just getting started. The needed plugins will be installed when you're following our [getting started guide](./getting-started.md).

## Test runners

A test runner plugin can hook into your test runner support coverage analysis or improve performance. If your test runner isn't listed here, you can probably still use the
[command test runner](./configuration#testrunner-string).

- [Jasmine](./jasmine-runner.md) ([@stryker-mutator/jasmine-runner](https://github.com/stryker-mutator/stryker/tree/master/packages/jasmine-runner))
- [Jest](./jest-runner.md) ([@stryker-mutator/jest-runner](https://github.com/stryker-mutator/stryker/tree/master/packages/jest-runner))
- [Karma](./karma-runner.md) ([@stryker-mutator/karma-runner](https://github.com/stryker-mutator/stryker/tree/master/packages/karma-runner))
- [Mocha](./mocha-runner.md) ([@stryker-mutator/mocha-runner](https://github.com/stryker-mutator/stryker/tree/master/packages/mocha-runner))

Removed:

- ~~Web Component Tester~~ ([@stryker-mutator/wct-runner](https://github.com/stryker-mutator/stryker/tree/v3.3.1/packages/wct-runner)) (Removed in v4 of Stryker).

After choosing your test runner plugin, install 

## Reporters

A reporter plugin can act on events that happen during the mutation testing process. They should be used to, well, report results, or progress.

Stryker already comes with the most useful reporters included:

- progress: Report progress during mutation testing.
- dots: Report progress as dots during mutation testing.
- clear-text: A clear text report at the end of the mutation testing phase.
- html: An HTML report. See [Stryker's own report](https://dashboard.stryker-mutator.io/reports/github.com/stryker-mutator/stryker/master) for an example.
- dashboard: Upload your mutation testing report to the [Stryker dashboard](https://dashboard.stryker-mutator.io). See the [dashboard docs](./General/dashboard.md) for more information.
- event-recorder: Write all events to disk. Useful for debug purposes.

## Checkers

A checker plugin can _check_ a mutant before it is mutation tested. The check can _fail_ or _pass_; when a check fails, the mutant is not mutation tested.

- **[TypeScript](./typescript-checker) (@stryker-mutator/typescript-checker)**: This checker will check each mutant for typescript compile errors.

## &lt;Your plugin here&gt;

You can write your plugins for Stryker. Interested? Have a look at our [create a plugin guide](./guides/create-a-plugin).