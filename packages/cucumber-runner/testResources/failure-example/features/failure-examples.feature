Feature: Failure examples

  @failed
  Scenario: Failed step
    Given a success step
    When a failed step

  @not-implemented
  Scenario: Not implemented step
    Given a success step
    When a not implemented step

  @ambiguous
  Scenario: Ambigious step
    Given a success step
    When a success step
    Then an ambiguous step

  @pending
  Scenario: Pending step
   Given a success step
   When a pending step

  @multiple-things-wrong
  Scenario: Multiple things wrong
   Given a success step
   When a failed step
   Then an ambiguous step
   Then a pending step
