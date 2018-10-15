import * as chai from 'chai';
import { fsAsPromised } from '@stryker-mutator/util';
import * as chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const expect = chai.expect;
const expectFileExists = (path: string) => expect(fsAsPromised.exists(path), `File ${path} does not exist`).to.eventually.eq(true);
function expectMutationScore(score: string, annotation: string, actualContent: string) {
  const isMatch = new RegExp(`<th\\s+class="[^"]* text-${annotation}"[^>]*>${score}<\\/th>`, 'g').test(actualContent);
  expect(isMatch, `Mutation score ${score} with annotation ${annotation} not found in ${actualContent}`).is.ok;
}
describe('Verify stryker has ran correctly', () => {
  it('should report in html files', () => {
    return Promise.all([
      expectFileExists('reports/mutation/html/index.js.html'),
      expectFileExists('reports/mutation/html/index.html'),
    ]);
  });
  it('should contain the correct mutation score', () => {
    const indexContent = fs.readFileSync('reports/mutation/html/index.html', 'utf8');
    expectMutationScore('33.33', 'danger', indexContent);
  });
});
