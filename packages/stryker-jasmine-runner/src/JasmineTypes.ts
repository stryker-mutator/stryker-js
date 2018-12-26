declare namespace jasmine {
  interface Order {
    random: boolean;
    seed: string;
    new(options: { random: boolean; seed: string }): any;
    sort<T>(items: T[]): T[];
  }

  interface Trace {
    message: string;
    name: string;
    stack: any;
  }

  interface Result {
    type: string;
  }
  interface ExpectationResult extends Result {
    actual: any;
    expected: any;
    matcherName: string;
    message: string;
    trace: Trace;
    passed(): boolean;
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
    jasmineDone(/*runDetails: RunDetails // not needed ;) */): void;
    jasmineStarted?(suiteInfo: SuiteInfo): void;
    specDone(result: CustomReporterResult): void;
    specStarted(/*result: CustomReporterResult // not needed ;) */): void;
    suiteDone?(result: CustomReporterResult): void;
    suiteStarted?(result: CustomReporterResult): void;
  }

  interface Env {
    throwOnExpectationFailure(value: boolean): void;
  }
}

declare module 'jasmine' {

  class Jasmine {
    public static ConsoleReporter(): any;
    public completionReporter: jasmine.CustomReporter;
    public env: jasmine.Env;
    public exit: (code: number) => void;
    public helperFiles: string[];
    public projectBaseDir: string;
    public reporter: jasmine.CustomReporter;
    public reportersCount: number;
    public showingColors: boolean;
    public specFiles: string[];
    constructor(options: any);
    public addReporter(reporter: jasmine.CustomReporter): void;
    public addSpecFile(filePath: string): void;
    public addSpecFiles(files: string[]): void;
    public clearReporters(): void;
    public configureDefaultReporter(options: any, ...args: any[]): void;
    public coreVersion(): string;
    public execute(files?: string[], filterString?: string): any;
    public exitCodeCompletion(passed: any): void;
    public loadConfig(config: any): void;
    public loadConfigFile(configFilePath: any): void;
    public loadHelpers(): void;
    public loadSpecs(): void;
    public onComplete(onCompleteCallback: (passed: boolean) => void): void;
    public printDeprecation(): void;
    public randomizeTests(value?: any): boolean;
    public seed(value: any): void;
    public showColors(value: any): void;
    public stopOnSpecFailure(value: boolean): void;
    public stopSpecOnExpectationFailure(value: boolean): void;
  }
  export = Jasmine;
}
