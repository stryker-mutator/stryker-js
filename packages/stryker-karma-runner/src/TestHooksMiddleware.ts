import { RequestHandler } from 'express';
import * as url from 'url';

export const TEST_HOOKS_FILE_NAME = '__test_hooks_for_stryker__.js';

export default class TestHooksMiddleware {

  public currentTestHooks: string = '';

  public handler(): RequestHandler {
    const self = this;
    return (request, response, next) => {
      const path = url.parse(request.url).pathname;
      if (path && path.endsWith(TEST_HOOKS_FILE_NAME)) {
        response.writeHead(200, {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'no-cache'
        });
        response.end(self.currentTestHooks);
      } else {
        next();
      }
    };
  }
}