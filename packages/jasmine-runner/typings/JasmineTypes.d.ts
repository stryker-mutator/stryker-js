declare namespace jasmine {
    interface Order {
        new (options: {
            random: boolean;
            seed: string;
        }): any;
        random: boolean;
        seed: string;
        sort<T>(items: T[]): T[];
    }
    interface Trace {
        name: string;
        message: string;
        stack: any;
    }
    interface Result {
        type: string;
    }
    interface ExpectationResult extends Result {
        matcherName: string;
        passed(): boolean;
        expected: any;
        actual: any;
        message: string;
        trace: Trace;
    }
    interface RunDetails {
        failedExpectations: ExpectationResult[];
        order: Order;
    }
    interface SuiteInfo {
        totalSpecsDefined: number;
    }
    interface CustomReportExpectation {
        message: string;
    }
    interface FailedExpectation extends CustomReportExpectation {
    }
    interface PassedExpectation extends CustomReportExpectation {
    }
    interface CustomReporterResult {
        failedExpectations?: FailedExpectation[];
        fullName: string;
        id: string;
        passedExpectations?: PassedExpectation[];
        pendingReason?: string;
        status?: string;
    }
    interface CustomReporter {
        jasmineStarted?(suiteInfo: SuiteInfo): void;
        suiteStarted?(result: CustomReporterResult): void;
        specStarted(): void;
        specDone(result: CustomReporterResult): void;
        suiteDone?(result: CustomReporterResult): void;
        jasmineDone(): void;
    }
    interface Env {
        oneFailurePerSpec(value: boolean): void;
    }
}
declare module 'jasmine' {
    class Jasmine {
        constructor(options: any);
        addReporter(reporter: jasmine.CustomReporter): void;
        addSpecFile(filePath: string): void;
        addSpecFiles(files: string[]): void;
        clearReporters(): void;
        configureDefaultReporter(options: any, ...args: any[]): void;
        env: jasmine.Env;
        execute(files?: string[], filterString?: string): any;
        exit: (code: number) => void;
        exitCodeCompletion(passed: any): void;
        loadConfig(config: any): void;
        loadConfigFile(configFilePath: any): void;
        loadHelpers(): void;
        loadSpecs(): void;
        onComplete(onCompleteCallback: (passed: boolean) => void): void;
        randomizeTests(value?: any): boolean;
        seed(value: any): void;
        showColors(value: any): void;
        oneFailurePerSpec(value: boolean): void;
        static ConsoleReporter(): any;
        reportersCount: number;
        completionReporter: jasmine.CustomReporter;
        reporter: jasmine.CustomReporter;
        coreVersion(): string;
        showingColors: boolean;
        projectBaseDir: string;
        printDeprecation(): void;
        specFiles: string[];
        helperFiles: string[];
    }
    export = Jasmine;
}
//# sourceMappingURL=JasmineTypes.d.ts.map