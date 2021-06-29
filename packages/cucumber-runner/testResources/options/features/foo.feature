Feature: Foo

  @foo
  Scenario: Foo should bar
    Then foo should "bar"

  @foo
  Scenario Outline: Foo should bar outline
    Then foo should "<name>"

    Examples:
      | name |
      | bar  |
      | baz  |
