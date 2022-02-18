import { fail } from 'assert';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * fs.promises.cp replacement, because it is coming from v16
 *
 * @see https://nodejs.org/api/fs.html#fspromisescpsrc-dest-options
 */
export async function fsPromisesCp(src: string, dest: string, options: { recursive: true }): Promise<void> {
  let exists = false;
  try {
    await fs.access(dest);
    exists = true;
  } catch {}
  if (exists) {
    fail(`${dest} already exists!`);
  }

  const dirEntries = await fs.readdir(src, { withFileTypes: true });

  await fs.mkdir(dest, { recursive: true });
  await Promise.all(
    dirEntries.map(async (dirEntry) => {
      const srcFileName = path.join(src, dirEntry.name);
      if (dirEntry.isDirectory()) {
        await fsPromisesCp(srcFileName, path.join(dest, dirEntry.name), options);
      } else if (dirEntry.isFile()) {
        await fs.copyFile(srcFileName, path.join(dest, dirEntry.name));
      } else {
        fail(`${dest} is not a file or directory, not yet supported to copy.`);
      }
    })
  );
}
