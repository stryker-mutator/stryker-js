import { LitElement, html, property, customElement, svg } from 'lit-element';
import { Thresholds } from 'mutation-testing-report-schema';
import { pathJoin } from '../lib/codeHelpers';
import { MetricsResult } from 'mutation-testing-metrics';
import { toAbsoluteUrl } from '../lib/htmlHelpers';

@customElement('mutation-test-report-totals')
export class MutationTestReportTotalsComponent extends LitElement {
  @property()
  public model: MetricsResult | undefined;

  @property()
  public thresholds: Thresholds | undefined;

  @property()
  public currentPath: string[] = [];

  private readonly fileIcon = svg`<svg aria-label="file" class="octicon octicon-file" viewBox="0 0 12 16" version="1.1" width="12" height="16" role="img"><path fill-rule="evenodd" d="M6 5H2V4h4v1zM2 8h7V7H2v1zm0 2h7V9H2v1zm0 2h7v-1H2v1zm10-7.5V14c0 .55-.45 1-1 1H1c-.55 0-1-.45-1-1V2c0-.55.45-1 1-1h7.5L12 4.5zM11 5L8 2H1v12h10V5z"></path></svg>`;
  private readonly directoryIcon = svg`<svg aria-label="directory" class="octicon octicon-file-directory" viewBox="0 0 14 16" version="1.1" width="14" height="16" role="img"><path fill-rule="evenodd" d="M13 4H7V3c0-.66-.31-1-1-1H1c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1zM6 4H1V3h5v1z"></path></svg>`;

  public render() {
    if (this.model) {
      return html`
        <table class="table table-sm table-hover table-bordered table-no-top">
          ${this.renderHead()} ${this.renderTableBody(this.model)}
        </table>
      `;
    } else {
      return undefined;
    }
  }

  public renderHead() {
    return html`<thead>
      <tr>
        <th colspan="2" style="width: 217px">
          <div><span>File / Directory</span></div>
        </th>
        <th colspan="2">
          <div><span>Mutation score</span></div>
        </th>
        <th class="rotate text-center" style="width: 50px">
          <div><span># Killed</span></div>
        </th>
        <th class="rotate text-center" style="width: 50px">
          <div><span># Survived</span></div>
        </th>
        <th class="rotate text-center" style="width: 50px">
          <div><span># Timeout</span></div>
        </th>
        <th class="rotate text-center" style="width: 50px">
          <div><span># No coverage</span></div>
        </th>
        <th class="rotate text-center" style="width: 50px">
          <div><span># Ignored</span></div>
        </th>
        <th class="rotate text-center" style="width: 50px">
          <div><span># Runtime errors</span></div>
        </th>
        <th class="rotate text-center" style="width: 50px">
          <div><span># Compile errors</span></div>
        </th>
        <th class="rotate rotate-width-70 text-center" style="width: 70px">
          <div><span>Total detected</span></div>
        </th>
        <th class="rotate rotate-width-70 text-center" style="width: 70px">
          <div><span>Total undetected</span></div>
        </th>
        <th class="rotate rotate-width-70 text-center" style="width: 70px">
          <div><span>Total mutants</span></div>
        </th>
      </tr>
    </thead>`;
  }

  private renderTableBody(model: MetricsResult) {
    const renderChildren = () => {
      if (model.file) {
        return undefined;
      } else {
        return model.childResults.map((childResult) => {
          let fullName: string = childResult.name;
          while (!childResult.file && childResult.childResults.length === 1) {
            childResult = childResult.childResults[0];
            fullName = pathJoin(fullName, childResult.name);
          }
          return this.renderRow(fullName, childResult, pathJoin(...this.currentPath, fullName));
        });
      }
    };
    return html`
      <tbody>
        ${this.renderRow(model.name, model, undefined)} ${renderChildren()}
      </tbody>
    `;
  }

  private renderRow(name: string, row: MetricsResult, path: string | undefined) {
    const { mutationScore } = row.metrics;
    const scoreIsPresent = !isNaN(mutationScore);
    const coloringClass = this.determineColoringClass(mutationScore);
    const mutationScoreRounded = mutationScore.toFixed(2);
    const progressBarStyle = `width: ${mutationScore}%`;
    return html` <tr title="${row.name}">
      <td style="width: 32px;" class="icon no-border-right"
        >${row.file ? this.fileIcon : this.directoryIcon}</td
      >
      <td width="" class="no-border-left"
        >${typeof path === 'string' ? html`<a href="${toAbsoluteUrl(path)}">${name}</a>` : html`<span>${row.name}</span>`}</td
      >
      <td class="no-border-right vertical-middle">
        ${scoreIsPresent
        ? html` <div class="progress">
              <div
                class="progress-bar bg-${coloringClass}"
                role="progressbar"
                aria-valuenow="${mutationScoreRounded}"
                aria-valuemin="0"
                aria-valuemax="100"
                style="${progressBarStyle}"
              >
                ${mutationScoreRounded}%
              </div>
            </div>`
        : html` <span class="font-weight-bold text-muted">N/A</span> `}
      </td>
      <td style="width: 50px;" class="no-border-left font-weight-bold text-center text-${coloringClass}">
        ${scoreIsPresent ? mutationScoreRounded : undefined}
      </td>
      <td class="text-center">${row.metrics.killed}</td>
      <td class="text-center">${row.metrics.survived}</td>
      <td class="text-center">${row.metrics.timeout}</td>
      <td class="text-center">${row.metrics.noCoverage}</td>
      <td class="text-center">${row.metrics.ignored}</td>
      <td class="text-center">${row.metrics.runtimeErrors}</td>
      <td class="text-center">${row.metrics.compileErrors}</td>
      <th class="text-center">${row.metrics.totalDetected}</th>
      <th class="text-center">${row.metrics.totalUndetected}</th>
      <th class="text-center">${row.metrics.totalMutants}</th>
    </tr>`;
  }

  private determineColoringClass(mutationScore: number) {
    if (!isNaN(mutationScore) && this.thresholds) {
      if (mutationScore < this.thresholds.low) {
        return 'danger';
      } else if (mutationScore < this.thresholds.high) {
        return 'warning';
      } else {
        return 'success';
      }
    } else {
      return 'default';
    }
  }
}
