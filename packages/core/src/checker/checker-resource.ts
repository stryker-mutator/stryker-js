import { ActiveChecker, Checker } from '@stryker-mutator/api/check';

import { Resource } from '../concurrent';

export type CheckerResource = ActiveChecker & Checker & Resource;
