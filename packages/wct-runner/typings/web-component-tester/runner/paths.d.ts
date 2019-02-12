/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Expands a series of path patterns (globs, files, directories) into a set of
 * files that represent those patterns.
 *
 * @param baseDir The directory that patterns are relative to.
 * @param patterns The patterns to expand.
 * @returns The expanded paths.
 */
export declare function expand(baseDir: string, patterns: string[]): Promise<string[]>;
