const MAX_INT32_VALUE = Math.pow(2, 31) - 1;
console.log(`Sleeping for ${MAX_INT32_VALUE} ms, 'night 'night`);
setTimeout(() => console.log('done'), MAX_INT32_VALUE);