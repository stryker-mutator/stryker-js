#!/usr/bin/env node
import { StrykerServer } from '../dist/src/index.js';

process.title = 'stryker-server';
new StrykerServer(process.argv);
