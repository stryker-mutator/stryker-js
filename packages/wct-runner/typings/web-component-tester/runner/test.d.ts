import { Config } from './config';
import { Context } from './context';
/**
 * Runs a suite of web component tests.
 *
 * The returned Context (a kind of EventEmitter) fires various events to allow
 * you to track the progress of the tests:
 *
 * Lifecycle Events:
 *
 * `run-start`
 *   WCT is ready to begin spinning up browsers.
 *
 * `browser-init` {browser} {stats}
 *   WCT is ready to begin spinning up browsers.
 *
 * `browser-start` {browser} {metadata} {stats}
 *   The browser has begun running tests. May fire multiple times (i.e. when
 *   manually refreshing the tests).
 *
 * `sub-suite-start` {browser} {sharedState} {stats}
 *   A suite file has begun running.
 *
 * `test-start` {browser} {test} {stats}
 *   A test has begun.
 *
 * `test-end` {browser} {test} {stats}
 *  A test has ended.
 *
 * `sub-suite-end` {browser} {sharedState} {stats}
 *   A suite file has finished running all of its tests.
 *
 * `browser-end` {browser} {error} {stats}
 *   The browser has completed, and it shutting down.
 *
 * `run-end` {error}
 *   WCT has run all browsers, and is shutting down.
 *
 * Generic Events:
 *
 *  * log:debug
 *  * log:info
 *  * log:warn
 *  * log:error
 *
 * @param {!Config|!Context} options The configuration or an already formed
 *     `Context` object.
 */
export declare function test(options: Config | Context): Promise<void>;
