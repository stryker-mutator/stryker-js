import { readFile } from 'fs';
import { promisify } from 'util';

import { mutationTestReportSchema } from '@stryker-mutator/api/report';

const promisedReadFile = promisify(readFile);

export async function singleFileTemplate(report: mutationTestReportSchema.MutationTestResult) {
  const data = await promisedReadFile(require.resolve('mutation-testing-elements/dist/mutation-test-elements.js'), {
    encoding: 'utf-8',
  });

  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <script>
      ${data}
    </script>
  </head>
  <body>
    <img class="stryker-image" alt="Stryker" src="stryker-80x80.png" style="position: fixed; right: 0; top: 0; z-index: 10">
    <mutation-test-report-app titlePostfix="Stryker">
      Your browser doesn't support <a href="https://caniuse.com/#search=custom%20elements">custom elements</a>.
      Please use a latest version of an evergreen browser (Firefox, Chrome, Safari, Opera, etc).
    </mutation-test-report-app>
    <script>
      document.querySelector('mutation-test-report-app').report = ${JSON.stringify(report).replace(/<\/script>/g, '</sc" + "ript>')};
    </script>
  </body>
  </html>`;
}
