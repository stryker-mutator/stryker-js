// @ts-check
import { lastValueFrom, ReplaySubject } from 'rxjs';

const subject = new ReplaySubject();
subject.next(4);
subject.complete();
async function main() {
  console.log(await lastValueFrom(subject));
  console.log(await lastValueFrom(subject));
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
})
