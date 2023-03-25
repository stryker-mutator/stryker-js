#!/usr/bin/env node
import { StrykerCli } from '../dist/src/index.js';

process.title = 'stryker';
// Run the Stryker CLI
new StrykerCli(process.argv).run();
