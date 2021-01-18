const { merge, of, Subject, zip } = require('rxjs');
const { map, tap } = require('rxjs/operators');


const recycle = new Subject();

const worker$ = merge(of(0, 1), recycle);

zip(worker$, of('a', 'b', 'c', 'd'))
  .pipe(
    map(([worker, input]) => {
      const output = `(${worker}, ${input})`;
      console.log('passing', output);
      if (input === 'd') {
        throw new Error('input was d');
      }
      recycle.next(worker);
      return output;
    }),
    tap({ complete() { console.log('complete') } })
  ).subscribe(n => console.log('output', n));

