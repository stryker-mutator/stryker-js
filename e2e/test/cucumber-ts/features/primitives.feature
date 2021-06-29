Feature: Primitives

    Surrial should be able to serialize and deserialize primitives

    Scenario Outline: Serialize primitives
        Given an input <input>
        When I serialize
        Then the result is '<output>'

        Examples:
            | input | output |
            | 42    | 42     |
            | true  | true   |
            | "foo" | "foo"  |
            | null  | null   |


    Scenario Outline: Deserialize primitives
        Given an input '<input>'
        When I deserialize
        Then the result is <output>

        Examples:
            | input | output |
            | 42    | 42     |
            | true  | true   |
            | "foo" | "foo"  |
            | null  | null   |
