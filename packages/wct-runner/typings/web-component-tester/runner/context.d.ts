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
/// <reference types="socket.io" />
/// <reference types="express-serve-static-core" />
/// <reference types="node" />
import * as events from 'events';
import * as express from 'express';
import { ServerOptions } from 'polyserve/lib/start_server';
import * as http from 'spdy';
import { BrowserRunner } from './browserrunner';
import * as config from './config';
import { Plugin } from './plugin';
export declare type Handler = ((...args: any[]) => Promise<any>) | ((done: (err?: any) => void) => void) | ((arg1: any, done: (err?: any) => void) => void) | ((arg1: any, arg2: any, done: (err?: any) => void) => void) | ((arg1: any, arg2: any, arg3: any, done: (err?: any) => void) => void);
/**
 * Exposes the current state of a WCT run, and emits events/hooks for anyone
 * downstream to listen to.
 *
 * TODO(rictic): break back-compat with plugins by moving hooks entirely away
 *     from callbacks to promises. Easiest way to do this would be to rename
 *     the hook-related methods on this object, so that downstream callers would
 *     break in obvious ways.
 *
 * @param {Object} options Any initially specified options.
 */
export declare class Context extends events.EventEmitter {
    options: config.Config;
    private _hookHandlers;
    _socketIOServers: SocketIO.Server[];
    _httpServers: http.Server[];
    _testRunners: BrowserRunner[];
    constructor(options?: config.Config);
    /**
     * Registers a handler for a particular hook. Hooks are typically configured
     * to run _before_ a particular behavior.
     */
    hook(name: string, handler: Handler): void;
    /**
     * Registers a handler that will run after any handlers registered so far.
     *
     * @param {string} name
     * @param {function(!Object, function(*))} handler
     */
    hookLate(name: string, handler: Handler): void;
    /**
     * Once all registered handlers have run for the hook, your callback will be
     * triggered. If any of the handlers indicates an error state, any subsequent
     * handlers will be canceled, and the error will be passed to the callback for
     * the hook.
     *
     * Any additional arguments passed between `name` and `done` will be passed to
     * hooks (before the callback).
     *
     * @param {string} name
     * @param {function(*)} done
     * @return {!Context}
     */
    emitHook(name: 'define:webserver', app: express.Express, mapper: (app: Express.Application) => void, options: ServerOptions, done?: (err?: any) => void): Promise<void>;
    emitHook(name: 'prepare:webserver', app: express.Express, done?: (err?: any) => void): Promise<void>;
    emitHook(name: 'configure', done?: (err?: any) => void): Promise<void>;
    emitHook(name: 'prepare', done?: (err?: any) => void): Promise<void>;
    emitHook(name: 'cleanup', done?: (err?: any) => void): Promise<void>;
    emitHook(name: string, done?: (err?: any) => void): Promise<void>;
    emitHook(name: string, ...args: any[]): Promise<void>;
    /**
     * @param {function(*, Array<!Plugin>)} done Asynchronously loads the plugins
     *     requested by `options.plugins`.
     */
    plugins(): Promise<Plugin[]>;
    /**
     * @return {!Array<string>} The names of enabled plugins.
     */
    enabledPlugins(): string[];
    /**
     * @param {string} name
     * @return {!Object}
     */
    pluginOptions(name: string): any;
    static Context: typeof Context;
}
