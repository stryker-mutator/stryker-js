const { zip, range, Subject, partition, ReplaySubject } = require('rxjs');
const { tap, shareReplay } = require('rxjs/operators');

const subject = new ReplaySubject();

subject.next(0);

const n$ = subject.pipe(tap(n => console.log(`before replay ${n}`)), shareReplay(), tap(n => console.log(`after replay ${n}`)))


const sub1 = n$.subscribe(console.log.bind(console, 'sub1'));

subject.next(1);

const sub2 = n$.subscribe(console.log.bind(console, 'sub2'))


subject.next(2);

sub1.unsubscribe();
sub2.unsubscribe();

subject.next(3);
n$.subscribe(console.log.bind(console, 'sub3'));

subject.next(4);
