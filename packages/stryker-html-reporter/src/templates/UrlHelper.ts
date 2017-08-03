import { ScoreResult } from 'stryker-api/report';

export default class UrlHelper {
  public static relativeUrl(result: ScoreResult): string {
    if (result.representsFile) {
      return `${result.name}.html`;
    } else {
      return `${result.name}/index.html`;
    }
  }
}