# Contribute to Stryker

This is the contribution guide for Stryker. Great to have you here! Here are a few ways you can help make this project better.

## Team members

* Simon de Lang: Stryker dev. Started Stryker as part of his thesis at Info Support. [simondel](http://github.com/simondel) on github.
* Nico Jansen: Stryker dev. Originally came up with the idea for the mutation testing framework as a thesis at Info Support. 
[nicojs](http://github.com/nicojs) on github or [@_nicojs](https://twitter.com/_nicojs) on twitter
* Sander Koenders: Stryker dev. Creator of the stryker-webpack-plugin and stryker-jest-runner.

## Learn & listen

Get in touch with us through twitter ([@_simondel](https://twitter.com/_simondel) and [@_nicojs](https://twitter.com/_nicojs)) or via the [Stryker gitter](https://gitter.im/stryker-mutator/stryker).

## Runner Stryker locally

We use [Lerna](https://lernajs.io/) to manage the packages in this repository. You don't have to install it globally. The packages themselves can be found in the [packages folder](https://github.com/stryker-mutator/stryker/tree/master/packages). npm commands such as `npm test` can be executed from the root of the project but executing them inside of a package folder is more time efficient. However, we suggest running `npm test` in the root of the project before a commit to ensure that everything still works. To get Stryker running locally, please follow these steps:

1. Clone the repository
1. Install dependencies using `npm install` in the root of the project
1. Run `npm run build` in the root of the project once.
1. Run `npm test` in the root of the project or in one of the package folders

## VSCode environment configuration

We've chosen to **check in in our vscode configuration**. This makes development unified amongst stryker developers. VSCode is an open source code editor maintained by Microsoft. For more info and the download link, please visit https://code.visualstudio.com/.

After cloning this repo, open the workspace with `$ code workspace.code-workspace` (or open code and use file -> Open Workspace...).

Some quick notes to help you get started:

1. On the left side, you can see all stryker projects and plugins. Open files from there.
1. Use `CTRL+B` (or `⌘+B` on OSX) to open up the *Run build task* menu. This can enable typescript compilation + watch for a plugin directory.
1. Use `CTRL+Shift+D` (or `⌘⇧D` on OSX) to open up the *debug* pane. Here you can select a config to run. For example: select "Unit tests (stryker-api)" to run the unit tests for the `stryker-api` package. 
  * You can run the tests with `CTRL+F5` (or `⌃F5` on OSX).
  * You can debug the tests with `F5` (also `F5` on OSX). Setting breakpoints in your code and inspecting variables work as expected.

Have fun!

## Running Stryker on Stryker

We support mutation testing Stryker with Stryker! After you got Stryker working locally, you can follow these steps to mutation test Stryker:
1. Navigate to the root of the project
1. Build all Stryker packages: `npm run build`
1. Navigate to `packages/stryker` 
1. Run `node bin/stryker run`

## Adding new features

New features are welcome! Either as requests or proposals. 

1. Please create an issue first or let us know via the [Stryker gitter](https://gitter.im/stryker-mutator/stryker)
2. Create a fork on your github account.
3. When writing your code, please conform to the existing coding style.
   See [.editorconfig](https://github.com/stryker-mutator/stryker/blob/master/.editorconfig) and the [typescript guidelines](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines)
4. Please create or edit unit tests or integration tests.
5. Run the tests using `npm test`
6. When creating commits, please conform to [the angular commit message style](https://docs.google.com/document/d/1rk04jEuGfk9kYzfqCuOlPTSJw3hEDZJTBN5E5f1SALo/edit).
   Namely in the form `<type>(<scope>): <subject>\n\n[body]`
   * Type: feat, fix, docs, style, refactor, test, chore.
   * Scope can the the file or group of files (not a strict right or wrong)
   * Subject and body: present tense (~changed~*change*, ~added~*add*) and include motivation and contrasts with previous behavior
  

Don't get discouraged! We estimate that the response time from the
maintainers is around a day or so. 

# Bug triage

Found a bug? Don't worry, we'll fix it, or you can ;) 

Please report a bug report on our [issues page](https://github.com/stryker-mutator/stryker/issues). In this please:

1. Label the issue as bug
2. Explain what the bug is in clear English
3. Include reproduction steps
   This can be an example project, code snippit, etc
4. Include the expected behaviour.
5. Include actual behaviour.
6. Add more details if required (e.g. which browser, which test runner, which versions, etc)

# Community 
Do you want to help? Great! These are a few things you can do:

* Evangelize mutation testing  
  Mutation testing is still relatively new, especially in JavaScript. Please help us get the word out there!  
  Share your stories in blog posts an on social media. Please inform us about it! 
* Did you use Stryker? Your feedback is very valuable to us. Good and bad! Please contact us and let us know what you think!
