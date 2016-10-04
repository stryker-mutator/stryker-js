import MutantRunResultMatcher from '../../src/MutantRunResultMatcher';
import * as sinon from 'sinon';
import { expect } from 'chai';
import Mutant from '../../src/Mutant';
import { RunResult } from 'stryker-api/test_runner';

describe('MutantRunResultMatcher', () => {

  let sut: MutantRunResultMatcher;
  let mutants: any[];
  let runResultsByTestId: any[];

  beforeEach(() => {
    mutants = [];
    runResultsByTestId = [];
    sut = new MutantRunResultMatcher(mutants, runResultsByTestId);
  });

  describe('matchWithMutants()', () => {
    describe('with 2 mutants and 2 runResults', () => {
      let mutantOne: any, mutantTwo: any, runResultOne: any, runResultTwo: any;
      beforeEach(() => {
        mutantOne = { mutantOne: true, filename: '1', location: { start: { line: 5, column: 6 }, end: { line: 5, column: 6 } }, addRunResultForTest: sinon.stub() };
        mutantTwo = { mutantTwo: true, filename: '5', location: { start: { line: 10, column: 0 }, end: { line: 10, column: 0 } }, addRunResultForTest: sinon.stub() };
        runResultOne = { testOne: true }; // Add some data to make them not equal to each other
        runResultTwo = { testTwo: true };
        mutants.push(mutantOne);
        mutants.push(mutantTwo);
        runResultsByTestId.push(runResultOne);
        runResultsByTestId.push(runResultTwo);
      });

      describe('without code coverage info', () => {

        beforeEach(() => {
          sut.matchWithMutants();
        });

        it('should add both tests to the mutants', () => {
          expect(mutantOne.addRunResultForTest).to.have.been.calledWith(0, runResultOne);
          expect(mutantOne.addRunResultForTest).to.have.been.calledWith(1, runResultTwo);
          expect(mutantTwo.addRunResultForTest).to.have.been.calledWith(0, runResultOne);
          expect(mutantTwo.addRunResultForTest).to.have.been.calledWith(1, runResultTwo);
        });
      });

      describe('without the tests having covered the mutants', () => {

        beforeEach(() => {
          runResultOne.coverage = {
            anOtherFile: {
              '1': { // covers but in wrong src file
                start: { line: 5, column: 0 },
                end: { line: 5, column: 8 }
              }
            },
            s: { '1': 1 }
          };
          runResultTwo.coverage = {
            1: {
              statementMap: {
                '1': {
                  start: { line: 3, column: 0 },
                  end: { line: 5, column: 10 }
                },
                '2': {
                  start: { line: 5, column: 0 },
                  end: { line: 5, column: 10 }
                },
                '3': { // Smallest statement that surrounds the mutant. Differs based on column number
                  start: { line: 5, column: 4 },
                  end: { line: 5, column: 8 }
                },
              },
              s: {
                '1': 1,
                '2': 1,
                '3': 0
              }
            },
            5: {
              statementMap: {
                '1': {
                  start: { line: 0, column: 1 },
                  end: { line: 10, column: 5 }
                },
                '2': { // Smallest  statement that surround the mutant. Differs based on line number
                  start: { line: 9, column: 1 },
                  end: { line: 10, column: 5 }
                },
                '3': {
                  start: { line: 10, column: 1 },
                  end: { line: 10, column: 5 }
                }
              },
              s: {
                '1': 1,
                '2': 0,
                '3': 1
              }
            }
          };
          sut.matchWithMutants();
        });

        it('should not have added the run results to the mutants', () => {
          expect(mutantOne.addRunResultForTest).to.not.have.been.called;
          expect(mutantTwo.addRunResultForTest).to.not.have.been.called;
        });
      });

      describe('with tests having covered the mutants', () => {

        beforeEach(() => {
          // mutantOne = { filename: '1', lineNumber: 5, columnNumber: 6, addRunResultForTest: sinon.stub() };
          // mutantTwo = { filename: '5', lineNumber: 10, columnNumber: 0, addRunResultForTest: sinon.stub() };
          runResultOne.coverage = {
            1: {
              statementMap: {
                '1': {
                  start: { line: 4, column: 0 },
                  end: { line: 6, column: 0 }
                }
              }, s: { '1': 1 }
            },
            5: {
              statementMap: {
                '1': {
                  start: { line: 10, column: 0 },
                  end: { line: 10, column: 0 }
                }
              }, s: { '1': 1 }
            }
          };
          runResultTwo.coverage = {
            1: {
              statementMap: {
                '1': {
                  start: { line: 4, column: 0 },
                  end: { line: 5, column: 6 }
                }
              }, s: { '1': 1 }
            }
          };
          sut.matchWithMutants();
        });

        it('should have added the run results to the mutants', () => {
          expect(mutantOne.addRunResultForTest).to.have.been.calledWith(0, runResultOne);
          expect(mutantOne.addRunResultForTest).to.have.been.calledWith(1, runResultTwo);
          expect(mutantTwo.addRunResultForTest).to.have.been.calledWith(0, runResultOne);
          expect(mutantTwo.addRunResultForTest).to.not.have.been.calledWith(1, runResultTwo);
        });
      });

    });

    describe('should not result in regression', () => {
      it('should match up mutant for issue #151 (https://github.com/stryker-mutator/stryker/issues/151)', () => {

        const mutant = new Mutant('BlockStatement', 'juice-shop\\app\\js\\controllers\\SearchResultController.js', `angular.module('juiceShop').controller('SearchResultController', [\r\n  '$scope',\r\n  '$sce',\r\n  '$window',\r\n  '$uibModal',\r\n  '$location',\r\n  '$translate',\r\n  \'ProductService',\r\n  \'BasketService',\r\n  function ($scope, $sce, $window, $uibModal, $location, $translate, productService, basketService) {\r\n    \'use strict'\r\n\r\n    $scope.showDetail = function (id) {\r\n      $uibModal.open({\r\n        templateUrl: \'views/ProductDetail.html',\r\n        controller: \'ProductDetailsController',\r\n        size: \'lg',\r\n        resolve: {\r\n          id: function () {\r\n            return id\r\n          }\r\n        }\r\n      })\r\n    }\r\n\r\n    $scope.addToBasket = function (id) {\r\n      basketService.find($window.sessionStorage.bid).success(function (basket) {\r\n        var productsInBasket = basket.data.products\r\n        var found = false\r\n        for (var i = 0; i < productsInBasket.length; i++) {\r\n          if (productsInBasket[i].id === id) {\r\n            found = true\r\n            basketService.get(productsInBasket[i].basketItem.id).success(function (existingBasketItem) {\r\n              var newQuantity = existingBasketItem.data.quantity + 1\r\n              basketService.put(existingBasketItem.data.id, {quantity: newQuantity}).success(function (updatedBasketItem) {\r\n                productService.get(updatedBasketItem.data.ProductId).success(function (product) {\r\n                  $translate('BASKET_ADD_SAME_PRODUCT', {product: product.data.name}).then(function (basketAddSameProduct) {\r\n                    $scope.confirmation = basketAddSameProduct\r\n                  }, function (translationId) {\r\n                    $scope.confirmation = translationId\r\n                  })\r\n                }).error(function (err) {\r\n                  console.log(err)\r\n                })\r\n              }).error(function (err) {\r\n                console.log(err)\r\n              })\r\n            }).error(function (err) {\r\n              console.log(err)\r\n            })\r\n            break\r\n          }\r\n        }\r\n        if (!found) {\r\n          basketService.save({ProductId: id, BasketId: $window.sessionStorage.bid, quantity: 1}).success(function (newBasketItem) {\r\n            productService.get(newBasketItem.data.ProductId).success(function (product) {\r\n              $translate('BASKET_ADD_PRODUCT', {product: product.data.name}).then(function (basketAddProduct) {\r\n                $scope.confirmation = basketAddProduct\r\n              }, function (translationId) {\r\n                $scope.confirmation = translationId\r\n              })\r\n            }).error(function (err) {\r\n              console.log(err)\r\n            })\r\n          }).error(function (err) {\r\n            console.log(err)\r\n          })\r\n        }\r\n      }).error(function (err) {\r\n        console.log(err)\r\n      })\r\n    }\r\n\r\n    $scope.searchQuery = $sce.trustAsHtml($location.search().q)\r\n\r\n    productService.search($scope.searchQuery).success(function (products) {\r\n      $scope.products = products.data\r\n      for (var i = 0; i < $scope.products.length; i++) {\r\n        $scope.products[i].description = $sce.trustAsHtml($scope.products[i].description)\r\n      }\r\n    }).error(function (err) {\r\n      console.log(err)\r\n    })\r\n  }])\r\n`, `{\n}`, { 'start': { 'line': 13, 'column': 38 }, 'end': { 'line': 24, 'column': 5 } }, [357, 615]);
        mutants.push(mutant);

        const coveringTestResult: RunResult = { 'testNames': ['controllers SearchResultController should open a modal dialog with product details'], 'result': 0, 'succeeded': 1, 'failed': 0, 'coverage': { 'juice-shop\\app\\js\\controllers\\SearchResultController.js': { 'path': 'c:\\z\\github\\bkimminich\\juice-shop\\app\\js\\controllers\\SearchResultController.js', 's': { '1': 1, '2': 1, '3': 1, '4': 0, '5': 1, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0, '13': 0, '14': 0, '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0, '21': 0, '22': 0, '23': 0, '24': 0, '25': 0, '26': 0, '27': 0, '28': 0, '29': 0, '30': 0, '31': 0, '32': 1, '33': 1, '34': 1, '35': 1, '36': 0, '37': 0 }, 'b': { '1': [0, 0], '2': [0, 0] }, 'f': { '1': 1, '2': 1, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0, '13': 0, '14': 0, '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0, '21': 1, '22': 0 }, 'fnMap': { '1': { 'name': '(anonymous_1)', 'line': 10, 'loc': { 'start': { 'line': 10, 'column': 2 }, 'end': { 'line': 10, 'column': 100 } } }, '2': { 'name': '(anonymous_2)', 'line': 13, 'loc': { 'start': { 'line': 13, 'column': 24 }, 'end': { 'line': 13, 'column': 38 } } }, '3': { 'name': '(anonymous_3)', 'line': 19, 'loc': { 'start': { 'line': 19, 'column': 14 }, 'end': { 'line': 19, 'column': 26 } } }, '4': { 'name': '(anonymous_4)', 'line': 26, 'loc': { 'start': { 'line': 26, 'column': 25 }, 'end': { 'line': 26, 'column': 39 } } }, '5': { 'name': '(anonymous_5)', 'line': 27, 'loc': { 'start': { 'line': 27, 'column': 61 }, 'end': { 'line': 27, 'column': 79 } } }, '6': { 'name': '(anonymous_6)', 'line': 33, 'loc': { 'start': { 'line': 33, 'column': 73 }, 'end': { 'line': 33, 'column': 103 } } }, '7': { 'name': '(anonymous_7)', 'line': 35, 'loc': { 'start': { 'line': 35, 'column': 93 }, 'end': { 'line': 35, 'column': 122 } } }, '8': { 'name': '(anonymous_8)', 'line': 36, 'loc': { 'start': { 'line': 36, 'column': 77 }, 'end': { 'line': 36, 'column': 96 } } }, '9': { 'name': '(anonymous_9)', 'line': 37, 'loc': { 'start': { 'line': 37, 'column': 91 }, 'end': { 'line': 37, 'column': 123 } } }, '10': { 'name': '(anonymous_10)', 'line': 39, 'loc': { 'start': { 'line': 39, 'column': 21 }, 'end': { 'line': 39, 'column': 46 } } }, '11': { 'name': '(anonymous_11)', 'line': 42, 'loc': { 'start': { 'line': 42, 'column': 25 }, 'end': { 'line': 42, 'column': 40 } } }, '12': { 'name': '(anonymous_12)', 'line': 45, 'loc': { 'start': { 'line': 45, 'column': 23 }, 'end': { 'line': 45, 'column': 38 } } }, '13': { 'name': '(anonymous_13)', 'line': 48, 'loc': { 'start': { 'line': 48, 'column': 21 }, 'end': { 'line': 48, 'column': 36 } } }, '14': { 'name': '(anonymous_14)', 'line': 55, 'loc': { 'start': { 'line': 55, 'column': 105 }, 'end': { 'line': 55, 'column': 130 } } }, '15': { 'name': '(anonymous_15)', 'line': 56, 'loc': { 'start': { 'line': 56, 'column': 69 }, 'end': { 'line': 56, 'column': 88 } } }, '16': { 'name': '(anonymous_16)', 'line': 57, 'loc': { 'start': { 'line': 57, 'column': 82 }, 'end': { 'line': 57, 'column': 110 } } }, '17': { 'name': '(anonymous_17)', 'line': 59, 'loc': { 'start': { 'line': 59, 'column': 17 }, 'end': { 'line': 59, 'column': 42 } } }, '18': { 'name': '(anonymous_18)', 'line': 62, 'loc': { 'start': { 'line': 62, 'column': 21 }, 'end': { 'line': 62, 'column': 36 } } }, '19': { 'name': '(anonymous_19)', 'line': 65, 'loc': { 'start': { 'line': 65, 'column': 19 }, 'end': { 'line': 65, 'column': 34 } } }, '20': { 'name': '(anonymous_20)', 'line': 69, 'loc': { 'start': { 'line': 69, 'column': 15 }, 'end': { 'line': 69, 'column': 30 } } }, '21': { 'name': '(anonymous_21)', 'line': 76, 'loc': { 'start': { 'line': 76, 'column': 54 }, 'end': { 'line': 76, 'column': 74 } } }, '22': { 'name': '(anonymous_22)', 'line': 81, 'loc': { 'start': { 'line': 81, 'column': 13 }, 'end': { 'line': 81, 'column': 28 } } } }, 'statementMap': { '1': { 'start': { 'line': 1, 'column': 0 }, 'end': { 'line': 84, 'column': 5 } }, '2': { 'start': { 'line': 13, 'column': 4 }, 'end': { 'line': 24, 'column': 5 } }, '3': { 'start': { 'line': 14, 'column': 6 }, 'end': { 'line': 23, 'column': 8 } }, '4': { 'start': { 'line': 20, 'column': 12 }, 'end': { 'line': 20, 'column': 21 } }, '5': { 'start': { 'line': 26, 'column': 4 }, 'end': { 'line': 72, 'column': 5 } }, '6': { 'start': { 'line': 27, 'column': 6 }, 'end': { 'line': 71, 'column': 8 } }, '7': { 'start': { 'line': 28, 'column': 8 }, 'end': { 'line': 28, 'column': 51 } }, '8': { 'start': { 'line': 29, 'column': 8 }, 'end': { 'line': 29, 'column': 25 } }, '9': { 'start': { 'line': 30, 'column': 8 }, 'end': { 'line': 53, 'column': 9 } }, '10': { 'start': { 'line': 31, 'column': 10 }, 'end': { 'line': 52, 'column': 11 } }, '11': { 'start': { 'line': 32, 'column': 12 }, 'end': { 'line': 32, 'column': 24 } }, '12': { 'start': { 'line': 33, 'column': 12 }, 'end': { 'line': 50, 'column': 14 } }, '13': { 'start': { 'line': 34, 'column': 14 }, 'end': { 'line': 34, 'column': 68 } }, '14': { 'start': { 'line': 35, 'column': 14 }, 'end': { 'line': 47, 'column': 16 } }, '15': { 'start': { 'line': 36, 'column': 16 }, 'end': { 'line': 44, 'column': 18 } }, '16': { 'start': { 'line': 37, 'column': 18 }, 'end': { 'line': 41, 'column': 20 } }, '17': { 'start': { 'line': 38, 'column': 20 }, 'end': { 'line': 38, 'column': 62 } }, '18': { 'start': { 'line': 40, 'column': 20 }, 'end': { 'line': 40, 'column': 55 } }, '19': { 'start': { 'line': 43, 'column': 18 }, 'end': { 'line': 43, 'column': 34 } }, '20': { 'start': { 'line': 46, 'column': 16 }, 'end': { 'line': 46, 'column': 32 } }, '21': { 'start': { 'line': 49, 'column': 14 }, 'end': { 'line': 49, 'column': 30 } }, '22': { 'start': { 'line': 51, 'column': 12 }, 'end': { 'line': 51, 'column': 17 } }, '23': { 'start': { 'line': 54, 'column': 8 }, 'end': { 'line': 68, 'column': 9 } }, '24': { 'start': { 'line': 55, 'column': 10 }, 'end': { 'line': 67, 'column': 12 } }, '25': { 'start': { 'line': 56, 'column': 12 }, 'end': { 'line': 64, 'column': 14 } }, '26': { 'start': { 'line': 57, 'column': 14 }, 'end': { 'line': 61, 'column': 16 } }, '27': { 'start': { 'line': 58, 'column': 16 }, 'end': { 'line': 58, 'column': 54 } }, '28': { 'start': { 'line': 60, 'column': 16 }, 'end': { 'line': 60, 'column': 51 } }, '29': { 'start': { 'line': 63, 'column': 14 }, 'end': { 'line': 63, 'column': 30 } }, '30': { 'start': { 'line': 66, 'column': 12 }, 'end': { 'line': 66, 'column': 28 } }, '31': { 'start': { 'line': 70, 'column': 8 }, 'end': { 'line': 70, 'column': 24 } }, '32': { 'start': { 'line': 74, 'column': 4 }, 'end': { 'line': 74, 'column': 63 } }, '33': { 'start': { 'line': 76, 'column': 4 }, 'end': { 'line': 83, 'column': 6 } }, '34': { 'start': { 'line': 77, 'column': 6 }, 'end': { 'line': 77, 'column': 37 } }, '35': { 'start': { 'line': 78, 'column': 6 }, 'end': { 'line': 80, 'column': 7 } }, '36': { 'start': { 'line': 79, 'column': 8 }, 'end': { 'line': 79, 'column': 89 } }, '37': { 'start': { 'line': 82, 'column': 6 }, 'end': { 'line': 82, 'column': 22 } } }, 'branchMap': { '1': { 'line': 31, 'type': 'if', 'locations': [{ 'start': { 'line': 31, 'column': 10 }, 'end': { 'line': 31, 'column': 10 } }, { 'start': { 'line': 31, 'column': 10 }, 'end': { 'line': 31, 'column': 10 } }] }, '2': { 'line': 54, 'type': 'if', 'locations': [{ 'start': { 'line': 54, 'column': 8 }, 'end': { 'line': 54, 'column': 8 } }, { 'start': { 'line': 54, 'column': 8 }, 'end': { 'line': 54, 'column': 8 } }] } }, 'l': { '1': 1, '13': 1, '14': 1, '20': 0, '26': 1, '27': 0, '28': 0, '29': 0, '30': 0, '31': 0, '32': 0, '33': 0, '34': 0, '35': 0, '36': 0, '37': 0, '38': 0, '40': 0, '43': 0, '46': 0, '49': 0, '51': 0, '54': 0, '55': 0, '56': 0, '57': 0, '58': 0, '60': 0, '63': 0, '66': 0, '70': 0, '74': 1, '76': 1, '77': 1, '78': 1, '79': 0, '82': 0 } } }, 'errorMessages': [], 'timeSpent': 88 };
        runResultsByTestId.push(coveringTestResult);

        sut.matchWithMutants();
        expect(mutant.scopedTestIds).to.have.length(1);
        expect(mutant.scopedTestIds[0]).to.be.eq(0);
      });
    });
  });

});