import path from 'path';
import { fileURLToPath } from 'url';

export function resolveSetupFile(fileName: string): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../setup', fileName);
}
