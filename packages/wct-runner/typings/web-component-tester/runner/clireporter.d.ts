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
/// <reference types="node" />
/// <reference types="vinyl-fs" />
import * as events from 'events';
import { BrowserDef, Stats } from './browserrunner';
import * as config from './config';
export declare type State = 'passing' | 'pending' | 'failing' | 'unknown' | 'error';
export declare type CompletedState = 'passing' | 'failing' | 'pending' | 'unknown';
export interface TestEndData {
    state: CompletedState;
    /**
     * The titles of the tests that ran.
     */
    test: string[];
    duration: number;
    error: any;
}
export declare class CliReporter {
    prettyBrowsers: {
        [id: number]: string;
    };
    browserStats: {
        [id: number]: Stats;
    };
    emitter: events.EventEmitter;
    stream: NodeJS.WritableStream;
    options: config.Config;
    /**
     * The number of lines written the last time writeLines was called.
     */
    private linesWritten;
    constructor(emitter: events.EventEmitter, stream: NodeJS.WritableStream, options: config.Config);
    updateStatus(force?: boolean): void;
    writeTestError(browser: BrowserDef, data: TestEndData): void;
    stateIcon(state: State): string;
    prettyTest(data: TestEndData): string;
    prettyBrowser(browser: BrowserDef): any;
    log(...values: any[]): void;
    writeWrapped(blocks: string[], separator: string): void;
    write(line: string): void;
    writeLines(lines: string[]): void;
    flush(): void;
    static CliReporter: typeof CliReporter;
}
