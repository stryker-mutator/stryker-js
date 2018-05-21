#!/usr/bin/env node

const { execSync } = require('child_process');
const exec = (command) => execSync(command, { stdio: [0, 1, 2] });

const releaseRequirements = {
    pullRequest: 'false',
    branch: 'release',
    nodeVersion: 'node'
};

console.log(`Running on branch ${process.env.TRAVIS_BRANCH}, version ${process.env.TRAVIS_NODE_VERSION}, pull request: ${process.env.TRAVIS_PULL_REQUEST}`);
console.log(`Release requirements: ${JSON.stringify(releaseRequirements)}`);
if (process.env.TRAVIS_PULL_REQUEST === releaseRequirements.pullRequest
    && process.env.TRAVIS_BRANCH === releaseRequirements.branch
    && process.env.TRAVIS_NODE_VERSION === releaseRequirements.nodeVersion) {
    console.log('Alright man, let\'s do this!');
    exec('git fetch --unshallow');
    exec('echo "//registry.npmjs.org/:_authToken=\${NPM_KEY}" > ~/.npmrc');
    exec(`git remote add gh-publish https://${process.env.GIT_TOKEN}@github.com/stryker-mutator/stryker.git`)
    exec('git config --global user.email "strykermutator.npa@gmail.com"');
    exec('git config --global user.name "StrykerMutator"');
    exec('git fetch gh-publish');
    exec('git checkout --track -b master gh-publish/master');
    exec('npm run lerna-publish');
} else {
    console.log('That means no release for you buddy');
}
