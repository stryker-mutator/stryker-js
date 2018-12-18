import { Context } from './context';
import { Plugin } from './plugin';
export declare function setupOverrides(context: Context): Promise<void>;
export declare function loadPlugins(context: Context): Promise<Plugin[]>;
export declare function configure(context: Context): Promise<void>;
/**
 * The prepare step is where a lot of the runner's initialization occurs. This
 * is also typically where a plugin will want to spin up any long-running
 * process it requires.
 *
 * Note that some "plugins" are also built directly into WCT (webserver).
 */
export declare function prepare(context: Context): Promise<void>;
export declare function runTests(context: Context): Promise<void>;
export declare function cancelTests(context: Context): void;
