Feature: concat

    Scenario: concat a and b
    Given input 'foo'
    When concat with 'bar'
    Then the result should be 'foobar'

