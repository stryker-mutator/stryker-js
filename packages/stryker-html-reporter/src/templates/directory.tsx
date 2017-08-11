import * as typedHtml from 'typed-html';
import { ScoreResult } from 'stryker-api/report';
import { MutationScoreThresholds } from 'stryker-api/core';
import { resultTable } from './resultTable';
import { layout } from './layout';

export function directory(title: string, scoreResult: ScoreResult, depth: number, thresholds: MutationScoreThresholds) {
    return layout(title, depth, <div class="col-md-12">
        <div class="row">
            <div class="totals col-xs-11">
                {resultTable(scoreResult, title, thresholds)}
            </div>
        </div>
    </div>);
}