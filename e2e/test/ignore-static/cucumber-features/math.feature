Feature: Math

    Scenario: add
    Given input 40
    When add with 2
    Then the result should be 42
    
    Scenario: myMath.pi
    Given input myMath.pi
    Then the result should be 3.14
    
    Scenario: MyMath.pi
    Given input MyMath.pi
    Then the result should be '🥧'
