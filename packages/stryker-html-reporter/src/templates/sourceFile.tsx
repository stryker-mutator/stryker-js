import * as _ from 'lodash';
import * as typedHtml from 'typed-html';
import { MutationScoreThresholds } from 'stryker-api/core';
import { resultTable } from './resultTable';
import { layout } from './layout';
import { ScoreResult, SourceFile, MutantResult, MutantStatus } from 'stryker-api/report';
import Breadcrumb from '../Breadcrumb';
import { mutantTable } from './mutantTable';

export interface NumberedMutant {
    index: number;
    mutant: MutantResult;
}

export function sourceFile(result: ScoreResult, sourceFile: SourceFile | undefined, mutants: MutantResult[], breadcrumb: Breadcrumb, thresholds: MutationScoreThresholds) {
    const numberedMutants = _
        .sortBy(mutants, m => m.range[0])
        .map((mutant, index) => ({ mutant, index }));
    return layout(breadcrumb,
        <div class="col-lg-12">
            <div class="row">
                <div class="col-sm-11">
                    {resultTable(result, result.name, thresholds)}
                </div>
            </div>
            <div class="row">
                <div class="col-lg-7">
                    {legend(mutants)}
                    {code(sourceFile, numberedMutants)}
                </div>
                <div class="col-lg-5">
                    {mutantTable(numberedMutants, sourceFile ? sourceFile.content : '')}
                </div>
            </div>
        </div>);
}

function legend(mutants: MutantResult[]) {
    function displayCheckbox(state: MutantStatus, isChecked: boolean) {
        const filtered = mutants.filter(mutant => mutant.status === state);
        if (filtered.length) {
            return <div class="form-check form-check-inline">
                <label class="form-check-label">
                    <input class="form-check-input stryker-display" checked={isChecked} value={state.toString()} type="checkbox"></input>
                    {MutantStatus[state]} {`(${filtered.length})`}
                </label>
            </div>;
        } else {
            return '';
        }
    }

    return <div class="row legend">
        <form class="col-md-12" novalidate="novalidate">
            {displayCheckbox(MutantStatus.NoCoverage, true)}
            {displayCheckbox(MutantStatus.Survived, true)}
            {displayCheckbox(MutantStatus.Killed, false)}
            {displayCheckbox(MutantStatus.TimedOut, false)}
            {displayCheckbox(MutantStatus.RuntimeError, false)}
            {displayCheckbox(MutantStatus.TranspileError, false)}
            <a href="#" class="stryker-collapse-expand-all">Expand all</a>
        </form>
    </div>;
}

function code(sourceFile: SourceFile | undefined, mutants: NumberedMutant[]) {
    if (sourceFile) {
        return annotateCode(sourceFile, mutants);
    } else {
        return <pre><code>The source code itself was not reported at the `stryker-html-reporter`. Please report this issue at https://github.com/stryker-mutator/stryker/issues</code></pre>;
    }
}

function annotateCode(sourceFile: SourceFile, numberedMutants: NumberedMutant[]) {
    const currentCursorMutantStatuses = {
        killed: 0,
        survived: 0,
        timeout: 0,
        noCoverage: 0
    };
    const maxIndex = sourceFile.content.length - 1;

    const adjustCurrentMutantResult = (valueToAdd: number) => (numberedMutant: { mutant: MutantResult, index: number }) => {
        switch (numberedMutant.mutant.status) {
            case MutantStatus.Killed:
                currentCursorMutantStatuses.killed += valueToAdd;
                break;
            case MutantStatus.Survived:
                currentCursorMutantStatuses.survived += valueToAdd;
                break;
            case MutantStatus.TimedOut:
                currentCursorMutantStatuses.timeout += valueToAdd;
                break;
            case MutantStatus.NoCoverage:
                currentCursorMutantStatuses.noCoverage += valueToAdd;
                break;
        }
    };

    const determineBackground = () => {
        if (currentCursorMutantStatuses.survived > 0) {
            return getContextClassForStatus(MutantStatus.Survived) + '-light';
        } else if (currentCursorMutantStatuses.noCoverage > 0) {
            return getContextClassForStatus(MutantStatus.NoCoverage) + '-light';
        } else if (currentCursorMutantStatuses.timeout > 0) {
            return getContextClassForStatus(MutantStatus.TimedOut) + '-light';
        } else if (currentCursorMutantStatuses.killed > 0) {
            return getContextClassForStatus(MutantStatus.Killed) + '-light';
        }
        return null;
    };

    const annotate = (char: string, index: number) => {
        const mutantsStarting = numberedMutants.filter(m => m.mutant.range[0] === index);
        const mutantsEnding = numberedMutants.filter(m => m.mutant.range[1] === index);
        mutantsStarting.forEach(adjustCurrentMutantResult(1));
        mutantsEnding.forEach(adjustCurrentMutantResult(-1));
        const backgroundColorAnnotation = mutantsStarting.length || mutantsEnding.length || index === 0 ? `<span class="bg-${determineBackground()}">` : '';
        const backgroundColorEndAnnotation = ((mutantsStarting.length || mutantsEnding.length) && index > 0) || index === maxIndex ? '</span>' : '';
        try {
            const mutantsAnnotations = mutantsStarting.map(m =>
                <a href="#" class="stryker-mutant-button"
                    tabindex="0"
                    title={m.mutant.mutatorName}
                    data-content={getMutantContent(m.mutant)}
                    data-mutant-status-annotation={getContextClassForStatus(m.mutant.status)}
                    data-mutant-status={m.mutant.status}
                    data-mutant={m.index}>
                    <span class={`badge badge-${getContextClassForStatus(m.mutant.status)}`}>{m.index}</span>
                </a>
                + <span class="badge badge-info stryker-mutant-replacement" hidden="hidden" data-mutant={m.index}>{escapeHtml(m.mutant.replacement)}</span>);
            const originalCodeStartAnnotations = mutantsStarting.map(m => `<span class="stryker-original-code" data-mutant="${m.index}">`);
            const originalCodeEndAnnotations = mutantsEnding.map(m => '</span>');

            return `${backgroundColorEndAnnotation}${originalCodeEndAnnotations.join('')}${mutantsAnnotations.join('')}${originalCodeStartAnnotations.join('')}${backgroundColorAnnotation}${escapeHtml(char)}`;
        } catch (err) {
            console.log(err);
        }
    };
    return <pre><code class="lang-javascript">{mapString(sourceFile.content, annotate).join('')}</code></pre>;
}


function escapeHtml(unsafe: string) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


function getMutantContent(mutant: MutantResult) {
    return `status: ${MutantStatus[mutant.status]}`;
}

function getContextClassForStatus(status: MutantStatus) {
    switch (status) {
        case MutantStatus.Killed:
            return 'success';
        case MutantStatus.NoCoverage:
        case MutantStatus.Survived:
            return 'danger';
        case MutantStatus.TimedOut:
            return 'warning';
        case MutantStatus.RuntimeError:
        case MutantStatus.TranspileError:
            return 'secondary';
    }
}


/**
 * A `map` function, as in [1, 2].map(i => i+1), but for a string 
 */
function mapString<T>(source: string, fn: (char: string, index?: number) => T): T[] {
    let results: T[] = [];
    for (let i = 0; i < source.length; i++) {
        results.push(fn(source[i], i));
    }
    return results;
}


