
Feature: References

    Surrial should be able to serialize and deserialize reference types

    Scenario: Serialize an object

        Given a js value '{ foo: "bar", baz: 42 }'
        When I serialize
        Then the result is '{"foo":"bar","baz":42}'

    Scenario: Serialize an array
        Given a js value '[42, "test"]'
        When I serialize
        Then the result is '[42,"test"]'

    Scenario: Serialize an array in object combination
        Given a js value '[42, { foo: "test", yes: true, stuff: ["some", true] }]'
        When I serialize
        Then the result is '[42,{"foo":"test","yes":true,"stuff":["some",true]}]'

