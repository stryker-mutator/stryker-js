---
title: Getting started
custom_edit_url: https://github.com/stryker-mutator/stryker-js/edit/master/docs/getting-started.md
---

Install Stryker using [npm](https://nodejs.org).

![stryker-install](./images/stryker-install.gif)

## 1 Prepare

Make sure you have npm and nodejs installed. Open a terminal / command prompt and cd to the root of your project you want to mutation test.

```bash
cd my-project
```

---

## 2 Install

The easiest way to get started with Stryker is by installing the stryker-cli globally.
It is a small package which forwards commands to your local Stryker instance.

```bash
npm install -g stryker-cli
```

Optionally, you could also install Stryker directly yourself.

```bash
npm install --save-dev @stryker-mutator/core
```

If you choose to not install the stryker-cli, use `npx stryker` (after installing `@stryker-mutator/core` locally) instead of `stryker` for the rest of the quickstart.

---

## 3 Configure

Run this command to configure Stryker.

```bash
stryker init
```

If you're asked to install Stryker, choose **Yes**. Follow the questionnaire.

Please let us know if your option is missing here [by opening an issue](https://github.com/stryker-mutator/stryker/issues/new).

After the init is done, inspect the `stryker.conf.js` file.

For more information on what these options mean, take a look at the [Stryker readme](https://github.com/stryker-mutator/stryker/tree/master/packages/core#readme)

---

## 4 Let's kill some mutants

Run Stryker to mutation test your project

```bash
stryker run
```

Have troubles running Stryker? Try running with trace logging.

```bash
stryker run --logLevel trace
```

You can also have a look at the [readme file of stryker](https://github.com/stryker-mutator/stryker/tree/master/packages/core#readme) for more information about the configuration.

Please [report any issues](http://github.com/stryker-mutator/stryker/issues) you have or let us know [via Slack](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM).

