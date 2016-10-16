// import {TestFramework, TestFrameworkSettings, TestFrameworkFactory} from 'stryker-api/test_framework';

// const INTERCEPTOR_CODE = `(function(global){
//     var realIt = global.it, count = 0;
//     var scoped = %IDS_PLACEHOLDER%;
//     global.it = function(){
//         if(scoped && scoped.indexOf(count) >= 0){
//             var spec = realIt.apply(global, arguments);
//         }
//         count ++;
//     }
// })(window || global);`;


// export default class JasmineTestFramework implements TestFramework {

//   constructor(private settings: TestFrameworkSettings) {
//   }

//   select(ids: number[]): string {
//     return INTERCEPTOR_CODE.replace('%IDS_PLACEHOLDER%', JSON.stringify(ids));
//   }
// }

// TestFrameworkFactory.instance().register('jasmine', JasmineTestFramework);