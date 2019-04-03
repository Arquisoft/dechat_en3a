Feature: Example
 Scenario: should navigate to the main page
   When I navigate to "https://angular.io/"
   Then the title should be "Angular"
 
Scenario: should be able to see the Docs page
   When I navigate to "https://angular.io/"
   When I click the Docs button
   Then I should see a "What is Angular?" article