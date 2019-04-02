import * as typedHtml from 'typed-html';
import { mutationTestReportSchema } from '@stryker-mutator/api/report';

export function mutationTestReportIndexFile(report: mutationTestReportSchema.MutationTestResult) {
    return <html>
        <head>
            <script src='mutation-test-elements.js'></script>
        </head>
        <body>
            <img class='stryker-image' alt='Stryker' src={`stryker-80x80.png`} style='position: fixed; right: 0; top: 0; z-index: 10'></img>
            <mutationTestReportApp titlePostfix='Stryker'>
                Your browser doesn't support <a href='https://caniuse.com/#search=custom%20elements'>custom elements</a>.
                Please use a latest version of an evergreen browser (Firefox, Chrome, Safari, Opera, etc).
            </mutationTestReportApp>
            <script>
                document.querySelector('mutation-test-report-app').report = {JSON.stringify(report)};
            </script>
        </body>
    </html>;
}
