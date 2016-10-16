import MutantTestMatcher from '../../src/MutantTestMatcher';
import * as sinon from 'sinon';
import { expect } from 'chai';
import Mutant from '../../src/Mutant';
import { RunResult, RunState, CoverageCollectionPerTest, CoverageCollection } from 'stryker-api/test_runner';

xdescribe('MutantTestMatcher', () => {

  let sut: MutantTestMatcher;
  let mutants: any[];
  let runResult: RunResult;

  beforeEach(() => {
    mutants = [];
    runResult = { tests: [], state: RunState.Complete };
    sut = new MutantTestMatcher(mutants, runResult);
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
        runResult.tests.push(runResultOne);
        runResult.tests.push(runResultTwo);
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

        const coverageResult: CoverageCollection = { 'juice-shop\\app\\js\\controllers\\SearchResultController.js': { 's': { '1': 1, '2': 1, '3': 1, '4': 0, '5': 1, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0, '13': 0, '14': 0, '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0, '21': 0, '22': 0, '23': 0, '24': 0, '25': 0, '26': 0, '27': 0, '28': 0, '29': 0, '30': 0, '31': 0, '32': 1, '33': 1, '34': 1, '35': 1, '36': 0, '37': 0 }, } };
        runResult.coverage = { 0: coverageResult };
        sut.matchWithMutants();
        expect(mutant.scopedTestIds).to.have.length(1);
        expect(mutant.scopedTestIds[0]).to.be.eq(0);
      });
    });
  });

});