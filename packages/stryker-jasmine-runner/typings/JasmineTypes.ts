declare namespace jasmine {
  interface Order {
    new(options: { random: boolean, seed: string }): any;
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
    // matcherName: string;
    message: string;
    // passed: boolean;
    // stack: string;
  }

  interface FailedExpectation extends CustomReportExpectation {
    // actual: string;
    // expected: string;
  }

  interface PassedExpectation extends CustomReportExpectation {

  }

  interface CustomReporterResult {
    // description: string;
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
    specStarted(/*result: CustomReporterResult // not needed ;) */): void;
    specDone(result: CustomReporterResult): void;
    suiteDone?(result: CustomReporterResult): void;
    jasmineDone(/*runDetails: RunDetails // not needed ;) */): void;
  }

  interface Env {
    throwOnExpectationFailure(value: boolean): void;
  }
}

declare module 'jasmine' {

  class Jasmine {
    constructor(options: any);
    public addReporter(reporter: jasmine.CustomReporter): void;
    public addSpecFile(filePath: string): void;
    public addSpecFiles(files: string[]): void;
    public clearReporters(): void;
    public configureDefaultReporter(options: any, ...args: any[]): void;
    public env: jasmine.Env;
    public execute(files?: string[], filterString?: string): any;
    public exit: (code: number) => void;
    public exitCodeCompletion(passed: any): void;
    public loadConfig(config: any): void;
    public loadConfigFile(configFilePath: any): void;
    public loadHelpers(): void;
    public loadSpecs(): void;
    public onComplete(onCompleteCallback: (passed: boolean) => void): void;
    public randomizeTests(value?: any): boolean;
    public seed(value: any): void;
    public showColors(value: any): void;
    public stopSpecOnExpectationFailure(value: boolean): void;
    public stopOnSpecFailure(value: boolean): void;
    public static ConsoleReporter(): any;
    public reportersCount: number;
    public completionReporter: jasmine.CustomReporter;
    public reporter: jasmine.CustomReporter;
    public coreVersion(): string;
    public showingColors: boolean;
    public projectBaseDir: string;
    public printDeprecation(): void;
    public specFiles: string[];
    public helperFiles: string[];
  }
  export = Jasmine;
}
