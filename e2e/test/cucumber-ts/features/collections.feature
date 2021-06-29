Feature: collections

    Surrial should be able to serialize and deserialize collections

    Scenario: Serialize Set
        Given a js value 'new Set([42, "foo", []])'
        When I serialize
        Then the result is 'new Set([42, "foo", []])'

    Scenario: Serialize Map
        Given a js value 'new Map([[42, "foo"], [true, "bar"]])'
        When I serialize
        Then the result is 'new Map([[42, "foo"], [true, "bar"]])'

