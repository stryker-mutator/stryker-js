Feature: Add

Scenario: Add 40 and 2
When I add 40 and 2
Then I get 42

Scenario: Greet hello world
When I greet "world"
Then I get "👋 world"

Scenario: Result in 1 when inc 0
When I inc 0
# Forget the expect 🙄 should survive
