Feature: Math

    Scenario: add
    Given input 1
    When add with 2
    Then the result should be 3
    
    Scenario: multiply
    Given input 2
    When multiplied with 1
    Then the result should be 2

    # Missing feature for `addOne` -> surviving / noCoverage mutant
