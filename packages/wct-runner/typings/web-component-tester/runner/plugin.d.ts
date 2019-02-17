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
import { Config } from './config';
import { Context } from './context';
export interface Metadata {
}
/**
 * A WCT plugin. This constructor is private. Plugins can be retrieved via
 * `Plugin.get`.
 */
export declare class Plugin {
    name: string;
    cliConfig: Config;
    packageName: string;
    metadata: Metadata;
    constructor(packageName: string, metadata: Metadata);
    /**
     * @param {!Context} context The context that this plugin should be evaluated
     *     within.
     */
    execute(context: Context): Promise<void>;
    /**
     * Retrieves a plugin by shorthand or module name (loading it as necessary).
     *
     * @param {string} name
     */
    static get(name: string): Promise<Plugin>;
    /**
     * @param {string} name
     * @return {string} The short form of `name`.
     */
    static shortName(name: string): string;
    static Plugin: typeof Plugin;
}
