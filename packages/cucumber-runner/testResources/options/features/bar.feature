Feature: Bar

  @bar
  Scenario: Bar should baz
    Then bar should "baz"

  @bar
  Scenario Outline: Bar should baz outline
    Then bar should "<name>"

    Examples:
      | name |
      | baz  |
      | qux  |

  @bar @bar-rule
  Rule: When bar is baz

  Example: then bar is baz
    Then bar is "baz"

