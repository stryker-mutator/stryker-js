import type Separator from 'inquirer/lib/objects/separator.js';

/**
 * The "ChoiceType" is used often and is annoying to keep in sync (types change often).
 * Defining it once and using it often in an attempt to reduce maintenance.
 */
export type ChoiceType = Separator | string;
