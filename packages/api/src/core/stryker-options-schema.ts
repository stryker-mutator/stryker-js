import { readFileSync } from 'fs';
import { URL } from 'url';

const strykerCoreSchema: Record<string, unknown> = JSON.parse(
  readFileSync(
    new URL('../../schema/stryker-core.json', import.meta.url),
    'utf-8',
  ),
);

export { strykerCoreSchema };
