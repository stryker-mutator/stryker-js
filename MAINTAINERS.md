# StrykerJS maintainer handbook

## Introduction
We've written this document for:

1. Active maintainers of StrykerJS
1. Prospective maintainers of StrykerJS
1. Anyone curious about how StrykerJS's maintainers maintain StrykerJS

The purpose of this document is to _describe our processes_. We want to avoid conflicts and confusion around "unwritten rules". In our opinion, the most straightforward way to address this is to _write them down_. This _also_ happens to be the most straightforward way to change them!

## Code of conduct
See [Code of conduct](https://github.com/stryker-mutator/stryker-js/blob/master/CODE_OF_CONDUCT.md)

## Contributor
This is the most important thing:
**You don't have to write code to be a contributor!**

A "contributor" is any individual who has given back in some way to the project and its community. Contributions include (but are not limited to):
1. Reporting bugs which follow the reporting guidelines
1. Suggesting and debating enhancements that have wide applicability
1. Helping others with Stryker-related questions on [Slack](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM), or other sites.
1. Sending pull requests which fix bugs, improve documentation, improve developer experience, improve code quality, and/or implement requested enhancements
1. Reviewing code on pull requests
1. Providing design assets
1. Posting a tutorial on a personal blog or blogging site
1. Suggesting usages for project funds
1. Organizing a "Stryker" event or workshop
1. Spreading the love for mutation testing and test quality in general.
1. Recruiting more contributors! Don't spam.
1. Researching the user base, getting feedback, etc. Don't spam.

A contributor is usually a user as well, but this isn't a hard-and-fast rule. A contributor is also expected to adhere to the [Code of conduct](https://github.com/stryker-mutator/stryker-js/blob/master/CODE_OF_CONDUCT.md) as a user would.

## Maintainer 
A maintainer has certain "rights" (or "permissions") to the StrykerJS project and other projects under the stryker-mutator organization. These rights come with increased responsibilities.

However, **there is no expectation of a standard of technical ability** to be a maintainer of StrykerJS. This doesn't imply a lack of technical oversight--every pull request will eventually be reviewed.

**If you think you aren't experienced enough to maintain a project like StrykerJS, you are incorrect.** The only requirements are the above responsibilities and a desire to help the project. It bears repeating:

**You don't have to write code to be a maintainer!**

> A maintainer is synonymous with "Collaborator" and/or "Owner" in GitHub parlance.

### The Responsibilities of a Maintainer
As a maintainer, you are expected to not just "follow" the code of conduct, but embody its values. Your public behavior, whether in the physical or virtual world, reflects upon the project and other maintainers.

> If you don't understand the code of conduct, or why it exists, it is your responsibility to educate yourself. This does not imply the CoC is immutable.

Furthermore, a maintainer is a contributor who contributes regularly, or expresses a desire to do so. That could be every day--but it might be once a week, or even once a month. Your boss doesn't work here; contribute as often as you wish. We are all people with Real Lives, and for many of us, contributing to OSS is just a hobby!

Finally, a maintainer must help define what makes Stryker "Stryker". At a minimum, a maintainer must understand the current definition (if a maintainer is not interested in decision-making). Some of these questions include:
* What's the scope of StrykerJS?
* Where should we focus our efforts?
* What's urgent, what can wait?
* What can we break? What's off-limits?
* What user feedback is valuable? What isn't?

As maintainers, _we work together_ to learn about the nature of these questions. If we try hard enough, we even come to some answers!

A maintainer _must_ also have 2FA enabled on their GitHub account.

### The Rights of a Maintainer
You may choose to do zero or more of these at their discretion:
1. Merge pull requests
1. Modify issues (closing, adding labels, assigning them to other maintainers, etc.)
1. Cancel builds, restart jobs, or otherwise interact with our CI server(s)
1. CRUD operations on GitHub integrations
1. Participate in the decision-making process

### About "Owners"
Some maintainers will have full admin rights to the stryker-mutator organization and/or will have access to publish to npm.

1. Those with publishing access are expected to use npm's 2FA.
1. This level of access will be granted by the current owners to those maintainers who have earned the project's trust.
1. Add new maintainers to the team.

## Reaching decisions 
StrykerJS follows a [consensus-seeking decision-making](https://en.wikipedia.org/wiki/Consensus-seeking_decision-making) process. In other words, all maintainers attempt to come to an agreement. If that fails, owners will decide.

Active maintainers will make an effort to solicit feedback from others before making important or potentially controversial decisions. Given the varying geographical distribution and availability of the maintenance team, we resolve to do the best we can to solicit feedback.

In other words, to have your opinion heard, participate regularly. The rest of the team won't wait on feedback that isn't necessarily forthcoming!

### Communication
Maintainers will mainly gather in [the stryker channel on slack]([Slack](https://join.slack.com/t/stryker-mutator/shared_invite/enQtOTUyMTYyNTg1NDQ0LTU4ODNmZDlmN2I3MmEyMTVhYjZlYmJkOThlNTY3NTM1M2QxYmM5YTM3ODQxYmJjY2YyYzllM2RkMmM1NjNjZjM)). This is a _public_ channel, and _anyone_ can join.

Video conference (or audio) calls may happen on a regular or irregular basis, as schedules allow. This is mainly because we have Real Lives and time zones suck.

### Working with Issues & Pull Requests
All new issues will need to be triaged, and pull requests must be examined. Maintainers must understand [Semantic Versioning](http://semver.org) ("SemVer"), as StrykerJS follows it semi-strictly.

We’re also using [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) (or see [summary here](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716)). This means that the **commit message decides the next release version number** as well as the **annotation in the changelog**. This why it is important to always _squash merge_ PR’s and decide on a good commit message.

Some examples:

✅ A feature without breaking change.
> feat(karma-runner): resolve local karma and ng version
> 
> Require `karma` or `@angular/cli` from the current working directory, instead of from `@stryker-mutator/karma-runner/src/util.js` (where the old `requireModule` function lived).

✅ Fix something in the docs (won’t appear in changelog)
> docs(plugins): fix dead link

✅ A feature with a breaking change
> feat(jest-runner): remove deprecated project types
> 
> Remove deprecated project types.
> * `react` --> `create-react-app`
> * `react-ts` --> `create-react-app-ts`
>
> BREAKING CHANGE: Project types `react` and `react-ts` have been removed. Please use `create-react-app` and `create-react-app-ts` respectively

❌ Comment message has to be present tense
> ~~ feat(karma-runner): resolved local karma and ng version ~~

❌ Format issues:
> ~~ feat(karma-runner) resolved local karma and ng version ~~
> ~~ feat resolved local karma and ng version (#2622) ~~

❌ Scope too vague
> ~~feat(stryker): allow for coverageAnalysis "all" in jest-runner~~


It is important to note that these message are **not necessary when contributing a PR**, only when **squash merging them** (we only care about commit messages on the master branch).

Once more: **Only use squash merge to the master branch**.

### Commenting on Issues and Reviewing Pull Requests
**All maintainers should be courteous and kind.** Thank the external contributor for the pull request, even if it is not merged. If the pull request has been opened (and subsequently closed) without discussion in a corresponding issue, let them know that by creating an issue first, they could have saved wasted effort. _Clearly and objectively_ explain the reasoning for rejecting any PR.

If you need more information on an issue, nicely ask the user to provide it. Remind them to use the issue/PR templates if they have not. If the user never gets around to it, the "stalebot" will close it eventually anyhow.

#### Reviewing Code
Use GitHub's code review features. Requesting a review from another maintainer _may or may not_ actually result in a review; don't wait on it. If the PR cannot move forward without input from a certain maintainer, _assign them to the PR_. If you’re waiting on someone, send them a direct message on Slack.

#### The Part About Jerks
There will be jerks.

#### Rude or Entitled People
These are users who feel the StrykerJS project and its maintainers _owe them_ time or support. This is incorrect.

However, this behavior is often indicative of someone who is "new" to open source. Many just don't know better. It is not your _responsibility_ to educate them (again, you owe them nothing).

Here are some suggestions:
1. If u mad, wait 20 minutes before writing a comment.
1. "Kill them with kindness". Explain how they are presenting themselves; maybe link to a good article or two about it.
1. Don't make it about "users vs. maintainers". Treat them like a potential future maintainer.
1. Avoid adding to the drama. You could try to reach out privately; email may be in their GitHub profile. You will likely never hear from that individual again (problem solved)
1. If an issue is getting out of control, lock it.
1. If someone is _repeatedly_ rude and does not correct their mistakes, you may ban them from participating in the `stryker-mutator` org. If you do not have permission to do so, contact someone who does (an "owner").

### When do we release?
We release when we feel like it. However, we don’t want to overwhelm users with new versions. That’s why we’ve decided to release major versions a maximum of 2 times a year. Furthermore, we might decide to group features together, in order to not release multiple minor versions in a short period of time.

## Scope of Stryker
The Stryker Mutator initiative consists of 3 main mutation testing frameworks:
* StrykerJS (for JavaScript and friends)
* Stryker.NET (for C# and maybe other .NET languages)
* Stryker4s (for scala and maybe other JVM languages)

Since Stryker began only for JavaScript and friends, it started with the name "Stryker", but we since migrated to "StrykerJS". 

The scope for StrykerJS is "JavaScript and friends". This includes all test frameworks and all babel parsable JavaScript languages. Some examples:

* A [TypeScript](typescriptlang.org/) project with [mocha](mochajs.org/)
* A [Flow](https://flow.org/) project with [jest](jestjs.io/)
* A [React](https://reactjs.org) project using [react-scripts](https://www.npmjs.com/package/react-scripts)
* An [Angular](https://angular.io/) project using the [angular cli](https://cli.angular.io/)
* A [Vue](https://vuejs.org/) project using the [vue cli](https://cli.vuejs.org/)
* A [koa.js](https://koajs.com/) nodejs app with [node-tap](https://node-tap.org/)
* A [plain old es5](https://www.oreilly.com/library/view/javascript-the-good/9780596517748/) project using a custom JS script for testing.
* …

However, we only support languages parsable by babel, so too bad for [coffee script](https://coffeescript.org/#) or [dart](https://dart.dev/).
