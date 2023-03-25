Feature: classes

    Surrial should be able to serialize and deserialize classes and class instances

    Scenario: Serialize Class instance
        Given a js value 'new Person("foo", 42)'
        When I serialize with Person as known class
        Then the result is 'new Person("foo", 42)'

    Scenario: Deserialize Class instance
        Given an input 'new Person("foo", 42)'
        When I deserialize with Person as known class
        Then the result is js value 'new Person("foo", 42)'

