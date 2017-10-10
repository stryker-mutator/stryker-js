import * as path from 'path';
import * as typedHtml from 'typed-html';
import { ScoreResult } from 'stryker-api/report';
import { MutationScoreThresholds } from 'stryker-api/core';
import UrlHelper from './UrlHelper';

export function resultTable(model: ScoreResult, title: string, thresholds: MutationScoreThresholds) {
    return <table class="table table-sm table-hover table-bordered table-no-top">
        {head}
        {tbody(model, title, thresholds)}
    </table>;
}

const head = <thead>
    <tr>
        <th style="width: 20%"><div><span>File / Directory</span></div></th>
        <th colspan="2"><div><span>Mutation score</span></div></th>
        <th class="rotate text-center" style="width: 50px"><div><span># Killed</span></div></th>
        <th class="rotate text-center" style="width: 50px"><div><span># Survived</span></div></th>
        <th class="rotate text-center" style="width: 50px"><div><span># Timeout</span></div></th>
        <th class="rotate text-center" style="width: 50px"><div><span># No coverage</span></div></th>
        <th class="rotate text-center" style="width: 50px"><div><span># Runtime errors</span></div></th>
        <th class="rotate text-center" style="width: 50px"><div><span># Transpile errors</span></div></th>
        <th class="rotate rotate-width-70 text-center" style="width: 70px"><div><span>Total detected</span></div></th>
        <th class="rotate rotate-width-70 text-center" style="width: 70px"><div><span>Total undetected</span></div></th>
        <th class="rotate rotate-width-70 text-center" style="width: 70px"><div><span>Total mutants</span></div></th>
    </tr>
</thead>;

function tbody(model: ScoreResult, title: string, thresholds: MutationScoreThresholds): string {
    return <tbody>
        {row(model, title, thresholds)}
        {model.childResults.map(childResult => childRow(childResult, thresholds))}
    </tbody>;
}

function childRow(model: ScoreResult, thresholds: MutationScoreThresholds): string {
    return row(model, `&nbsp;&nbsp;${<a href={UrlHelper.relativeUrl(model)}>{model.name + (model.representsFile ? '' : path.sep)}</a>}`, thresholds);
}

function row(model: ScoreResult, title: string, thresholds: MutationScoreThresholds): string {
    const mutationScoreRounded = model.mutationScore.toFixed(2);
    const coloringClass = getColoringClass(model.mutationScore, thresholds);
    return <tr>
        <td>{title}</td>
        <td>
            <div class="progress">
                <div class={'progress-bar bg-' + coloringClass} role="progressbar" aria-valuenow={mutationScoreRounded} aria-valuemin="0" aria-valuemax="100"
                    style={`width: ${mutationScoreRounded}%;`}>
                    {mutationScoreRounded}%
            </div>
            </div>
        </td>
        <th class={'text-center text-' + coloringClass} style="width: 10%">{mutationScoreRounded}</th>
        <td class="text-center">{model.killed}</td>
        <td class="text-center">{model.survived}</td>
        <td class="text-center">{model.timedOut}</td>
        <td class="text-center">{model.noCoverage}</td>
        <td class="text-center">{model.runtimeErrors}</td>
        <td class="text-center">{model.transpileErrors}</td>
        <th class="text-center">{model.totalDetected}</th>
        <th class="text-center">{model.totalUndetected}</th>
        <th class="text-center">{model.totalMutants}</th>
    </tr>;
}

function getColoringClass(score: number, thresholds: MutationScoreThresholds) {
    if (score < thresholds.low) {
        return 'danger';
    } else if (score < thresholds.high) {
        return 'warning';
    } else {
        return 'success';
    }
}