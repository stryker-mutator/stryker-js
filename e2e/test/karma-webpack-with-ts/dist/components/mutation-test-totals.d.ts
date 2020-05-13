import { LitElement } from 'lit-element';
import { Thresholds } from 'mutation-testing-report-schema';
import { MetricsResult } from 'mutation-testing-metrics';
export declare class MutationTestReportTotalsComponent extends LitElement {
    model: MetricsResult | undefined;
    thresholds: Thresholds | undefined;
    currentPath: string[];
    private readonly fileIcon;
    private readonly directoryIcon;
    render(): import("lit-element").TemplateResult | undefined;
    private renderHead;
    private renderTableBody;
    private renderRow;
    private determineColoringClass;
}
//# sourceMappingURL=mutation-test-totals.d.ts.map