// import JasmineTestFramework from '../../../src/jasmine_test_framework/JasmineTestFramework';
// import { TestFrameworkSettings, TestFrameworkFactory } from 'stryker-api/test_framework';
// import { expect } from 'chai';

// describe('JasmineTestFramework', () => {

//   let sut: JasmineTestFramework;
//   let settings: TestFrameworkSettings;

//   beforeEach(() => {
//     settings = { options: null };
//   });

//   it('should register it under "jasmine" in the TestFrameworkFactory', () => {
//     expect(TestFrameworkFactory.instance().create('jasmine', settings)).to.be.instanceof(JasmineTestFramework);
//   });

//   describe('when constructed', () => {

//     beforeEach(() => {
//       sut = new JasmineTestFramework(settings);
//     });

//     describe('when select() is called with an array', () => {
//       let result: string;

//       beforeEach(() => {
//         result = sut.select([1, 2, 3, 4]);
//       });

//       it('should give the correct file content', () => {
//         expect(result).to.be.eq(`(function(global){
//     var realIt = global.it, count = 0;
//     var scoped = [1,2,3,4];
//     global.it = function(){
//         if(scoped && scoped.indexOf(count) >= 0){
//             var spec = realIt.apply(global, arguments);
//         }
//         count ++;
//     }
// })(window || global);`);
//       });
//     });

//   });
// });