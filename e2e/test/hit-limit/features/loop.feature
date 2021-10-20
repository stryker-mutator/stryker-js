Feature: Loop

  Scenario: Sum
    Given a sum function
    When I loop 5 times
    Then the result should be 15
