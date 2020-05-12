"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createMutantResult(overrides) {
    const defaults = {
        id: '1',
        location: {
            end: {
                column: 3,
                line: 1,
            },
            start: {
                column: 1,
                line: 1,
            },
        },
        mutatorName: 'bazMutator',
        replacement: 'baz',
        status: "Killed" /* Killed */,
    };
    return Object.assign(Object.assign({}, defaults), overrides);
}
exports.createMutantResult = createMutantResult;
function createFileResult(overrides) {
    const defaults = {
        language: 'js',
        mutants: [createMutantResult()],
        source: 'const bar = foo();',
    };
    return Object.assign(Object.assign({}, defaults), overrides);
}
exports.createFileResult = createFileResult;
function createMetricsResult(overrides) {
    const defaults = {
        childResults: [],
        metrics: createMetrics(),
        name: 'foo',
    };
    return Object.assign(Object.assign({}, defaults), overrides);
}
exports.createMetricsResult = createMetricsResult;
function createMetrics(overrides) {
    const defaults = {
        killed: 0,
        survived: 0,
        timeout: 0,
        compileErrors: 0,
        runtimeErrors: 0,
        noCoverage: 0,
        ignored: 0,
        totalCovered: 0,
        totalDetected: 0,
        totalInvalid: 0,
        totalMutants: 0,
        totalUndetected: 0,
        totalValid: 0,
        mutationScore: 0,
        mutationScoreBasedOnCoveredCode: 0,
    };
    return Object.assign(Object.assign({}, defaults), overrides);
}
exports.createMetrics = createMetrics;
//# sourceMappingURL=factory.js.map